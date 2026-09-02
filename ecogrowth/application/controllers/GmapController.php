<?php

class GmapController extends Zend_Controller_Action
{
	var $db;

    public function init()
    {
		$this->db = Zend_Db_Table::getDefaultAdapter();
		$admin = new Application_Model_Admin($params);
        $auth = Zend_Auth::getInstance();
        $authStorage = $auth->getStorage();
		if($role=='cust'){
			$this->_helper->viewRenderer->setNoRender(true);
			$this->_helper->layout()->disableLayout();
			$this->_redirect('/index');
		}

    }
	
public function trackAction(){
		$this->checklogin();
		$user                 		= new Application_Model_User();
		$this->view->getUserList 	= $user_list  = $user->getUserList();
}

public function legendHelpAction(){
	$this->_helper->layout->disableLayout();
}
	
public function trackAllAction(){
	$this->checklogin();
	$gmapModel = new Application_Model_Gmap();
	$this->view->productTypeList = $gmapModel->productTypeList();
	$this->view->callTypeList = $gmapModel->callTypeList();
	$this->view->circleList = $gmapModel->circleList();
	$this->view->customerList = $gmapModel->customerList();	
}	
	public function customerAction(){
	
	$params = $this->getRequest()->getParams();
	
	$gmapModel = new Application_Model_Gmap();

	$joballdata = $gmapModel->getCustomerAllJobs($params);		
	$this->view->jobs = $joballdata; 
	
	foreach($joballdata as $single_job){
	$user_list[$single_job['curr_Alloted_Eng_Code']] = $single_job['curr_Alloted_Eng_Code'];
	}
	
	//print_r($user_list);die;	
	$allUsersLocation = $gmapModel->getUsersCurrentLoc($user_list);
	$this->view->users = $allUsersLocation;
	$this->view->params = $params; 

	$this->_helper->layout->disableLayout();
	
	}
	
    public function indexAction()
    {
		
	$this->checklogin();
	$params = $this->getRequest()->getParams();
	if(trim($params['user'])!=''){
		$params['user'] = $params['user'];
		}
	if($params['dates']!=''){
		$date =	$this->dateConverter($params['dates']);
	}else{
		$date =	date("Y-m-d");
	}
		$sqlQuery = $this->db->select() ->from('tbl_user_path',array('*')) ->where('user_id =?',$params['user'])->where(new Zend_Db_Expr('date_format(add_date_time,"%Y-%m-%d") ="'. $date.'"'))->order('add_date_time asc')->limit(1);  
		$result = $this->db->fetchRow($sqlQuery);
		$this->view->center_coord = $result; 		

		if($params['user_type'] == 'vendor'){
			$sqlQuery = $this->db->select()->from('tbl_vendor',array('id', 'vendor_name as name', 'latitude', 'longitude'))->where('id =?',$params['user']);  
		}else{
			$sqlQuery = $this->db->select()->from('tbl_user',array('id', 'name', 'latitude', 'longitude'))->where('id =?',$params['user']);  
		}
		
		$result = $this->db->fetchRow($sqlQuery);
		$this->view->current_coord = $result; 


		$this->view->user = $params['user'];

		// $joballdata = $gmap->getAllJobs($params['user']);

		$query = "select s.*,l.latitude, l.longitude from tbl_site_allocation  AS s
		left join tbl_location_mapping AS l on (s.infratel_id = l.infratel_site_id) 
		where 1"; 
		$this->view->jobs = $job =$this->db->fetchAll($query);


		$sqlQuery = $this->db->select() ->from('tbl_user_path',array('*')) ->where('user_id =?',$params['user'])->where(new Zend_Db_Expr('date_format(add_date_time,"%Y-%m-%d") ="'. $date.'"'))->order('add_date_time asc')->limit(2000);  
		$result = $this->db->fetchAll($sqlQuery);

		$site_array = array();
		foreach ($result as  $value) {
			if($params['user_type'] == 'vendor'){
				$sqlQuery = $this->db->select()->from('tbl_vendor',array('id', 'vendor_name as name', 'latitude', 'longitude'))->where('id =?',$value['user_id']);  
			}else{
				$sqlQuery = $this->db->select()->from('tbl_user',array('id', 'name', 'latitude', 'longitude'))->where('id =?',$value['user_id']);  
			}
			$user = $this->db->fetchRow($sqlQuery);

			$site_details = array('id'=>$value['id'], 'user_id'=>$value['user_id'], 'user_type'=>$value['user_type'], 'latitude'=>$value['latitude'], 'longitude'=>$value['longitude'], 'battery_status'=>$value['battery_status'], 'travelled_distance'=>$value['travelled_distance']
				, 'add_date_time'=>$value['add_date_time'], 'call_log_no'=>$value['call_log_no'], 'move_status'=>$value['move_status'], 'time_spend'=>$value['time_spend'], 'random_string'=>$value['random_string'], 'user_name'=>$user['name']);
			array_push($site_array, $site_details);
		}
			
		$single_coord_array = array();
		foreach($site_array as $single_path_coord){
			$single_coord_array[] = 'new google.maps.LatLng('.$single_path_coord['latitude'].', '.$single_path_coord['longitude'].')';
		}
		$single_coord_array[] = $single_coord_array[0];
		$path_coords = implode(',',$single_coord_array);
		$this->view->path_coords = $path_coords; 

		$this->view->single_path_coord = $site_array; 
		 //echo '<pre>';
	     //print_r($job);
		 //print_r($site_array);
		 //exit();
                
                
	 	$this->_helper->layout->disableLayout();
    }

    public function getUserListAction(){
        $user_type =  $this->_getParam('user_type'); 

        if($user_type == 'vendor'){
            $sql = "select id, vendor_name as name from tbl_vendor where status=1 order by vendor_name asc";
        }else{
            $sql = "select id, name from tbl_user where status=1 order by name asc";
        }
        
        $user_list_data = $this->db->fetchAll($sql);

        $user_list[] = array("value"=>"",'text'=>"-Select User-");
        foreach($user_list_data as $key){
        $user_list[] = array("value"=>$key['id'],"text"=>$key['name']);
        }
        // print_r($project);
        // exit();
        $this->getHelper('Layout')->disableLayout();
        $this->getHelper('ViewRenderer')->setNoRender();
        $this->getResponse()->setHeader('Content-Type', 'application/json');
        echo json_encode(array('options'=>$user_list));
        return; 
    }

    function dateConverter($var)
    {
        $date = explode('/', $var);
        $final_date = $date['2'].'-'.$date['1'].'-'.$date['0'];
        return $final_date;
    }

	public function checklogin()
	{
		$auth = Zend_Auth::getInstance();
		
		$errorMessage = ""; 
		/*************** check user identity ************/
		if(!$auth->hasIdentity())  
		{  
			$this->_redirect('/index');  
		} 
	}

}



