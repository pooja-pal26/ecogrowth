<?php
/**
* Logimetrix Techsolution Pvt. Ltd.
 * File Name   : ReportController.php
 * File Description  : Report Controller
 * Created By : Ajay Kumar
 * Created Date: 07 July 2017
 */

class ReportController extends Zend_Controller_Action
{
	var $dbAdapter;

	public function init()
	{
		$this->checklogin();
		/* Initialize action controller here */
		$this->_flashMessenger  = $this->_helper->getHelper('FlashMessenger');
		$this->initView();
		$bootstrap        = $this->getInvokeArg('bootstrap');
		$aConfig        = $bootstrap->getOptions();
		$this->view->siteurl  = $aConfig['site']['image']['url'];
		$this->dbAdapter    = Zend_Db_Table::getDefaultAdapter(); 
		$auth                   = Zend_Auth::getInstance();
		$authStorage           = $auth->getStorage();
		$this->id              = $authStorage->read()->id;
		$this->role            = $authStorage->read()->role;
	}

  // public function indexAction()
  // {
  //   echo "Hello world!";exit;
  // }
	/*** taskReportAction() method is used to get task data */
	public function taskReportAction()
	{
		$this->checklogin();
        //echo "helsf";exit;
		$this->db              = Zend_Db_Table::getDefaultAdapter();
        //$this->view->messages  = $this->_flashMessenger->getMessages();  
		$this->view->params = $params = $this->getRequest()->getParams(); 
		$query = "select  s.*, u.name as allocate_user, sup.name as supervisor, v.vendor_name as vendor, st.name as status_name  from  tbl_site_allocation as s 
		left join tbl_user as u on (s.allocate_userid = u.id)
		left join tbl_user as sup on (s.supervisor_id = sup.id)
		left join tbl_vendor as v on (s.allocate_userid = v.id)
		left join tbl_site_status as st on (s.status = st.status)
		where 1";
		$allocate_site_list = $this->dbAdapter->fetchAll($query);
         // echo "<pre>";
         //    print_r($params);exit;

		if($this->getRequest()->isPost())
		{
			function dateConverter($var)
			{
				$date = explode('-', $var);
				$final_date = $date['2'].'-'.$date['1'].'-'.$date['0'];
				return $final_date;
			}

			if(!$params['date_fr'] && $params['date_tt']){

				$cond  .="and date(s.created) = '".dateConverter($params['date_tt'])."'";

			}

			if($params['date_fr'] && !$params['date_tt']){

				$cond  .="and date(s.created) = '".dateConverter($params['date_fr'])."'";
			}

			if($params['date_fr'] && $params['date_tt']){

				$cond  .="and date(s.created) between '".dateConverter($params['date_fr'])."' and '".dateConverter($params['date_tt'])."'";
			}
			$query1 = "select  s.*, u.name as allocate_user, sup.name as supervisor, v.vendor_name as vendor, st.name as status_name  from  tbl_site_allocation as s 
			left join tbl_user as u on (s.allocate_userid = u.id)
			left join tbl_user as sup on (s.supervisor_id = sup.id)
			left join tbl_vendor as v on (s.allocate_userid = v.id)
			left join tbl_site_status as st on (s.status = st.status)
			where 1 $cond ";
			$allocate_site_list = $this->dbAdapter->fetchAll($query1);
		}

		if($params['type'] == 'Generate'){

			$data = array(array('Sr. No.'=> "", 'PO'=> "", 'Site Id'=> "" , 'Assigned Date'=> "" ,'Status'=> "" , 'Zone '=> "" , 'Cluster'=> "" , 'Technician Name'=> "", 'Technician Mobile No.'=> "", 'Allocated User'=> ""));
			$i = 2; 
			foreach ($allocate_site_list as $rs) { 
				if($rs['allocate_user']){ $allocate_user= $rs['allocate_user']; }else { $allocate_user= 'N/A';}
				if($rs['supervisor']){ $supervisor= $rs['supervisor']; }else { $supervisor= 'N/A';}
				if($rs['vendor']){ $vendor= $rs['vendor']; }else { $vendor= 'N/A';}
				if($rs['status_name']){ $status_name= $rs['status_name']; }else { $status_name= 'N/A';}
				$row = array();
				$row[] = stripslashes($i-1);
				$row[] = stripslashes($rs['po_no']);
				$row[] = stripslashes($rs["site_id"]);
				$row[] = stripslashes($rs["created"]);
				$row[] = stripslashes($rs["status_name"]);
				$row[] = stripslashes($rs["zone"]);
				$row[] = stripslashes($rs['cluster']);
				$row[] = stripslashes($rs["tech_name"]);
				$row[] = stripslashes($rs["tech_mobile"]);                      
				$row[] = stripslashes($allocate_user);                                                        
				$data[] = $row;
				$i++;
			}
			function filterData(&$str){
				$str = preg_replace("/\t/", "\\t", $str);
				$str = preg_replace("/\r?\n/", "\\n", $str);
				if(strstr($str, '"')) $str = '"' . str_replace('"', '""', $str) . '"';
			}

                    // file name for download
			$fileName = "task-report.xls"; 

                    // headers for download
			header("Content-Disposition: attachment; filename=\"$fileName\"");
			header("Content-Type: application/vnd.ms-excel");

			$flag = false;
			foreach($data as $row) {
				if(!$flag) {
                            // display column names as first row
					echo implode("\t", array_keys($row));
					$flag = true;
				}
                        // filter data
				array_walk($row, 'filterData');
				echo implode("\t", array_values($row)) . "\n";
			}
			exit;
		}           

		$this->view->totalnum  = $params['page'];
		$page=$this->_getParam('page',1);
		$paginator = Zend_Paginator::factory($allocate_site_list);      
         $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
         $paginator->setItemCountPerPage(10); // number of items to show per page
         $this->view->paginator = $paginator;
         $this->view->totalrec = $paginator->getTotalItemCount(); 
         
       }
       public function checkAttendance($emp_id, $date){ 
        $this->checklogin();
        $sql = "select * from tbl_staff_office_attendance where   user_id = '".$emp_id."' and start_date LIKE '%".$date."%'";
        $result = $this->dbAdapter->fetchRow($sql);
        if($result){
         return true;
       }else{
         return false;
       }
     }
     public function checkSunday($date){
     	$this->checklogin(); 
     	$day = date("D", strtotime($date));
     	if($day == 'Sun'){
     		return true;
     	}else{
     		return false;
     	}
     }

     public function materialStockReportAction(){
     	try {
     		$this->checklogin();
     		$this->view->role_id = $this->id;
     		$params = $this->getRequest()->getParams();
     		$materialStockQuery = "SELECT tbl_inventory.*,tbl_product_type.product_type_name AS product_type,tbl_products.product_name FROM `tbl_inventory`
     		LEFT JOIN tbl_product_type on (tbl_inventory.product_type_id = tbl_product_type.id)
     		LEFT JOIN tbl_products on (tbl_inventory.product_id = tbl_products.id) ORDER BY tbl_inventory.created_at DESC";
     		$this->view->materialStocklist = $materialStocklist = $this->dbAdapter->fetchAll($materialStockQuery);
     	}
     	catch(Exception $e){
     		echo $e->getMessage();
     		exit;
     	}
     }


     public function materialStockInReportAction(){
     	try{
     		$this->checklogin();
     		$this->view->role_id = $this->id;
     		$params = $this->getRequest()->getParams();
     		$stockinsql = "SELECT tbl_stock_in.*, tbl_suppliers.name AS supplier_name, tbl_user.name AS receiver_name FROM tbl_stock_in 
     		LEFT JOIN tbl_suppliers ON (tbl_suppliers.id = tbl_stock_in.supplier_id)
     		LEFT JOIN tbl_user ON (tbl_user.id = tbl_stock_in.recieved_by)
     		ORDER BY tbl_stock_in.stock_in_date DESC";
     		$this->view->stockinlist = $stockinlist = $this->dbAdapter->fetchAll($stockinsql);
     	}
     	catch(Exception $e){
     		echo $e->getMessage();
     		exit;
     	}
     }


     public function viewStockinAction(){
     	try{
     		$params = $this->getRequest()->getParams();
        
     		$sql_unit = "SELECT tbl_stock_in_details.*,tbl_stock_in.stock_in_date,(tbl_product_type.product_type_name)AS product_type,tbl_products.product_name ,tbl_material_brand.brand_name as brand 
        FROM `tbl_stock_in_details`
        LEFT JOIN tbl_stock_in ON (tbl_stock_in_details.stock_in_id = tbl_stock_in.id)
        LEFT JOIN tbl_product_type ON (tbl_stock_in_details.product_type =tbl_product_type.id)
        LEFT JOIN tbl_material_brand ON (tbl_stock_in_details.brand_name = tbl_material_brand.id)
        LEFT JOIN tbl_products ON (tbl_stock_in_details.product_name = tbl_products.id) WHERE stock_in_id = '".$params['id']."'"; 
        
        $this->view->stockindetail= $stockindetail= $this->dbAdapter->fetchAll($sql_unit);

        // echo '<pre>';
        // print_r($sql_unit);
        // exit();
        $this->_helper->layout()->disableLayout();
      } catch(Exception $e){
       echo $e->getMessage();
       exit;
     }

   }
   public function materialStockOutReportAction()
   {
    try {
     $this->checklogin();
     $this->view->role_id = $this->id;
     $params = $this->getRequest()->getParams();
     $stockoutsql = "SELECT * FROM tbl_stock_out ORDER BY stock_out_date DESC";
     $this->view->stockoutlist = $stockoutlist = $this->dbAdapter->fetchAll($stockoutsql);
   }
   catch(Exception $e){
     echo $e->getMessage();
     exit;
   }
 }

 public function viewStockOutAction(){
  try{
   $params = $this->getRequest()->getParams();

   $sql_unit = "SELECT tbl_stock_out_details.quantity,tbl_stock_out_details.unit,(tbl_product_type.product_type_name) AS product_type,tbl_products.product_name,(tbl_material_brand.brand_name) AS brand FROM `tbl_stock_out_details`
   LEFT join tbl_product_type on (tbl_stock_out_details.product_type = tbl_product_type.id)
   LEFT join tbl_products on (tbl_stock_out_details.product_name = tbl_products.id)
   LEFT join tbl_material_brand on (tbl_stock_out_details.brand = tbl_material_brand.id) WHERE stock_out_id = '".$params['id']."'";
   $this->view->stockoutdetail =$stockoutdetail = $this->dbAdapter->fetchAll($sql_unit);
   $this->_helper->layout()->disableLayout();
 } catch(Exception $e){
   echo $e->getMessage();
   exit;
 }

}

//     public function dateConverter($var)
// 	{
// 		$date = explode('/', $var);
// 		$final_date = $date['2'].'-'.$date['1'].'-'.$date['0'];
// 		return $final_date;
// 	} 

public function summaryReportAction(){
     	try{
     		$this->checklogin();
     		$params = $this->getRequest()->getParams();
            
     		if($this->getRequest()->isPost()) {
     		    
    		    $date = explode('/', $params['from_date']);
		        $from_date = $date['2'].'-'.$date['1'].'-'.$date['0'];
    		    
    		    $date = explode('/', $params['to_date']);
		        $to_date = $date['2'].'-'.$date['1'].'-'.$date['0'];
    		    
     		    $finalArr = array();
     		    $i = 0;
     		    $sql = "SELECT * FROM tbl_po_details WHERE order_date BETWEEN '".$from_date."' AND '".$to_date."' ";
     		    
     		    $po_details = $this->dbAdapter->fetchAll($sql);
     		    
     		    foreach($po_details as $key=>$value) {
     		       
     		        $sql1 = "SELECT * FROM `tbl_po_sites` WHERE `po_no` LIKE '".$value['po_no']."'ORDER BY `id` DESC";
     		        $sites_details = $this->dbAdapter->fetchAll($sql1);
     		        
     		        if($value['po_no'] != '') {
     		            foreach($sites_details as $key1=>$value1) {
         		            if($value1['site_id'] != '') {
         		                $finalArr[$i]['site_id']= $value1['site_id'];
             		            $finalArr[$i]['site_name']= $value1['site_name'];
             		            $finalArr[$i]['order_date']= $value['order_date'];
             		            
             		            $sql2 = "SELECT SUM(amount) as site_expense FROM `tbl_site_expense` WHERE `po_no` LIKE '".$value['po_no']."' AND site_id LIKE \"".$value1['site_id']."\" AND status=1";
             		            $sites_expense = $this->dbAdapter->fetchAll($sql2);
             		           
             		            $finalArr[$i]['expenses'] = $sites_expense[0]['site_expense'];
             		            
             		            $sql3 = "SELECT SUM(invoice_value) as invoice_amount, SUM(received_amount) as received_amount FROM `tbl_punched_invoice_details` WHERE `po_no` LIKE '".$value['po_no']."' AND site_id LIKE \"".$value1['site_id']."\" ";
             		            $sites_invoices = $this->dbAdapter->fetchAll($sql3);
             		            
             		            $finalArr[$i]['invoice_amount']= $sites_invoices[0]['invoice_amount'];
             		            $finalArr[$i]['received_amount']= $sites_invoices[0]['received_amount'];
             		            $i++;
         		            }
         		        }   
     		        }
     		    }
     		  
     		    $this->view->finalArr = $finalArr;
     		    $this->from_date = $params['from_date'];
     		    $this->to_date = $params['to_date'];
     		}
     		
     	}
     	catch(Exception $e){
     		echo $e->getMessage();
     		exit;
     	}
     }



public function attendanceReportAction(){

  $this->checklogin(); 
  $params                = $this->view->params = $this->getRequest()->getParams(); 
  $this->db              = Zend_Db_Table::getDefaultAdapter();
  $roles                 = new Application_Model_User();
  $this->view->attendance_report = $attendance_report  = $roles->getAttendanceRecord();
  if($this->getRequest()->isPost())
  {
   function dateConverter($var)
   {
    $date = explode('-', $var);
    $final_date = $date['2'].'-'.$date['1'].'-'.$date['0'];
    return $final_date;
  }         
  $condition .="and date(created) BETWEEN '".dateConverter($params['date_fr'])."'  AND '".dateConverter($params['date_tt'])."'";
  $query1 = "select * from tbl_staff_attendance where 1 $condition ";
  $attendance_report = $this->db->fetchAll($query1);
}

if($params['type'] == 'Generate'){

 $data = array(array('Sr. No.'=> "", 'User'=> "", 'User Type'=> "" , 'Contact No.'=> "" ,'Start Day Datetime'=> "" , 'Start Day Latitude '=> "" , 'Start Day Longitude '=> "", 'End Day Datetime'=> "" , 'End Day Latitude'=> "", 'End Day Longitude'=> "", 'End Day Longitude'=> "",'Created'=> "",'Working Hour'=> ""));
 $i = 2; 
 foreach ($attendance_report as $rs) { 
  $diff = strtotime($rs['end_day_datetime']) - strtotime($rs['start_day_datetime']);
                          //$diff_in_hrs = $diff/3600;
  $hours   = floor(($diff - ($days * 86400)) / 3600);
  $minutes = floor(($diff - ($days * 86400) - ($hours * 3600))/60);

  $row = array();
  $row[] = stripslashes($i-1);
  $row[] = stripslashes($rs['user_id']);
  $row[] = stripslashes($rs["user_type"]);
  $row[] = stripslashes($rs["contact_no"]);
  $row[] = stripslashes($rs["start_day_datetime"]);
  $row[] = stripslashes($rs["start_day_latitude"]);
  $row[] = stripslashes($rs['start_day_longitude']);
  $row[] = stripslashes($rs["end_day_datetime"]);
  $row[] = stripslashes($rs["end_day_latitude"]);
  $row[] = stripslashes($rs["end_day_longitude"]);                        
  $row[] = stripslashes($rs["created"]);
  $row[] = stripslashes($hours.'h '.$minutes.'m ');                                                          
  $data[] = $row;
  $i++;
}
function filterData(&$str){
  $str = preg_replace("/\t/", "\\t", $str);
  $str = preg_replace("/\r?\n/", "\\n", $str);
  if(strstr($str, '"')) $str = '"' . str_replace('"', '""', $str) . '"';
}

                    // file name for download
$fileName = "attendance-report.xls"; 
                    // headers for download
header("Content-Disposition: attachment; filename=\"$fileName\"");
header("Content-Type: application/vnd.ms-excel");

$flag = false;
foreach($data as $row) {
  if(!$flag) {
                            // display column names as first row
   echo implode("\t", array_keys($row));
   $flag = true;
 }
                        // filter data
 array_walk($row, 'filterData');
 echo implode("\t", array_values($row)) . "\n";
}
exit;
}           
$page=$this->_getParam('page',1);
$paginator = Zend_Paginator::factory($attendance_report);      
          $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
          $paginator->setItemCountPerPage(10); // number of items to show per page
          $this->view->paginator = $paginator;
          $this->view->perPage = 10;
          $this->view->totalrec = $paginator->getTotalItemCount();
        }
        public function attendenceListAction()
        {
         $this->checklogin();
         $params                = $this->view->params = $this->getRequest()->getParams();
         $this->db              = Zend_Db_Table::getDefaultAdapter();
         $roles                 = new Application_Model_User();
         $attendance_report  = $roles->searchAttendanceRecord($params['date_from'],$params['date_to']);
         $this->view->totalnum   = $params['page'];
         $page=$this->_getParam('page',1);
         $paginator = Zend_Paginator::factory($attendance_report);      
          $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
          $paginator->setItemCountPerPage(10); // number of items to show per page
          $this->view->paginator = $paginator;
          $this->view->perPage = 10;
          $this->view->totalrec = $paginator->getTotalItemCount();  
        }

        function dateConverter($var)
        {
         $date = explode('/', $var);
         $final_date = $date['2'].'-'.$date['1'].'-'.$date['0'];
         return $final_date;
       }


       public function checklogin(){   
         $auth           = Zend_Auth::getInstance(); 
         $errorMessage   = ""; 
         /*************** check user identity ************/
         if(!$auth->hasIdentity()){
          $this->_redirect('/admin/index');  
        }   
      } 
    }