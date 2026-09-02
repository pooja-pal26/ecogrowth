<?php



class SiteallocationController extends Zend_Controller_Action
{

	public function init()
	{
		$this->_flashMessenger  = $this->_helper->getHelper('FlashMessenger');
		$this->initView();
		$bootstrap              = $this->getInvokeArg('bootstrap');
		$aConfig                = $bootstrap->getOptions();
		$this->view->siteurl    = $aConfig['site']['image']['url'];
		$this->dbAdapter        = Zend_Db_Table::getDefaultAdapter(); 
		$auth                   = Zend_Auth::getInstance();
		$authStorage           = $auth->getStorage();
		$this->id              = $authStorage->read()->id;
		$this->role            = $authStorage->read()->role;
		$this->role_type       = $authStorage->read()->role_type;
		$this->master_model       = new Application_Model_Master();
	}

	public function indexAction()
	{
		try {
			$this->checklogin();    
			$this->view->messages  = $this->_flashMessenger->getMessages(); 
			$this->view->role_type = $this->role_type; 
			$allocatedSiteQuery = $this->dbAdapter->select()
			->from("tbl_site_allocation", array("id","po_no","po_date","site_id","due_date"))
			->where("status = 1");
			$this->view->allocatedSites = $allocatedSiteResult = $this->dbAdapter->fetchAll($allocatedSiteQuery);

			// print_r($this->view->allocatedSites);
			// exit();
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
	}
	public function editAllocatedSiteAction()
	{
		try {
			$this->checklogin();
			$params = $this->getRequest()->getParams();
			echo $params['site-allocation-id']."==========";
		
			$allocatedSiteDetailsQuery = $this->dbAdapter->select()
			->from('tbl_site_allocation', array('*'))
			->where('md5(id) = ?', $params['site-allocation-id'])
			->where('status = 1')
			->where('site_completion_status != 5');
		 
			$this->view->allocatedSiteDetails = $allocatedSiteDetailsResult = $this->dbAdapter->fetchRow($allocatedSiteDetailsQuery);
		 
			$allocatedWorkDetailsQuery = $this->dbAdapter->select()
			->from('tbl_site_nature_of_work as tsn', array('*'))
			->joinLeft('tbl_nature_of_work as tnw','tnw.id = tsn.nature_of_work_id', array('nature_of_work'))
			->joinLeft('tbl_user as tu','tu.id = tsn.supervisor_id', array('name'))
			->joinLeft('tbl_vendor as tv','tv.id = tsn.vendor_id', array('vendor_name','contact_person'))
			->where('md5(site_allocation_id) = ?', $params['site-allocation-id']);
			$this->view->allocatedWorkDetails = $allocatedWorkDetailsResult = $this->dbAdapter->fetchAll($allocatedWorkDetailsQuery);
			$natureOfWorkQuery = $this->dbAdapter->select()
			->from("tbl_nature_of_work", array("id","nature_of_work"))
			->where("status = 1");
			$this->view->natureOfWork = $natureOfWorkResult = $this->dbAdapter->fetchAll($natureOfWorkQuery);     
			$userDetailsQuery = $this->dbAdapter->select()
			->from(array('tbl_user'),array('*'))
			->where("status = 1")
			->where("role_type = 3")
			->where("role = 15")
			->order('name ASC');
			$this->view->userDetails = $userDetailsResult  = $this->dbAdapter->fetchAll($userDetailsQuery);
			$vendorDetailsQuery = $this->dbAdapter->select()
			->from(array('tbl_vendor'),array('id','vendor_name','contact_person'))
			->where("status = 1")
			->order('vendor_name ASC');
			$this->view->vendorDetails = $vendorDetailsResult  = $this->dbAdapter->fetchAll($vendorDetailsQuery);
			if ($this->getRequest()->isPost()) {
				$deleteAllocatedWorkQuery = "DELETE FROM tbl_site_nature_of_work WHERE md5(site_allocation_id) = '".$params['site-allocation-id']."'";
				$this->dbAdapter->query($deleteAllocatedWorkQuery);
				foreach ($params['nature_of_work'] as $key => $value) 
				{
					$natureOfWorkData = array();
					$natureOfWorkData['site_id']              = $params['siteId'];
					$natureOfWorkData['site_allocation_id']   = $allocatedSiteDetailsResult['id'];
					$natureOfWorkData['nature_of_work_id']    = $value;
					$natureOfWorkData['allocation_type']      = $params['resource_type'][$key];
					if ($params['vendor_id'][$key]) {
						$natureOfWorkData['vendor_id']          = $params['vendor_id'][$key];
					}
					$natureOfWorkData['supervisor_id']        = $params['supervisor_id'][$key];
					$natureOfWorkData['work_completion_date']      = $this->dateConverter($params['completion_date'][$key]);
					$natureOfWorkData['created_at']           = date('Y-m-d H:i:s');
					$natureOfWorkData['created_by']           = $this->id;
					$this->dbAdapter->insert('tbl_site_nature_of_work', $natureOfWorkData);
				}
				$this->_flashMessenger->addMessage(array("success"=>"Site ".$params['siteId']." allocation has been updated successfully."));
				$this->_redirect('/siteallocation');
			}
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
	}

	public function allocatedSiteStatusAction()
	{
		try {
			$this->checklogin();

		} catch(Exception $e) {
			echo $e->getMessage();
			exit;
		}
	}
	public function deleteAllocatedSiteAction()
	{
		try {
			$this->checklogin();
			$response = array();
			$params = $this->getRequest()->getParams();
			if ($this->getRequest()->isPost()) {
				$updateData = array();
				if (!empty($params['allocated_site_id']) || $params['allocated_site_id'] != "") {
					$updateData['status'] = '0';
					$this->dbAdapter->beginTransaction();
					$allocationUpdateStatus = $this->dbAdapter->update('tbl_site_allocation', $updateData, array('id = ?'=> $params['allocated_site_id']));
					$workStatusUpdate['is_deleted'] = '1';
					$allocatedWorkUpdateStatus = $this->dbAdapter->update('tbl_site_nature_of_work', $workStatusUpdate, array('site_allocation_id = ?'=> $params['allocated_site_id']));
					$siteStatusUpdate = $this->dbAdapter->update('tbl_po_sites', $updateData, array('po_no = ?'=> $params['po_number'], 'site_id = ?' => $params['site_id']));
					if ($allocationUpdateStatus == true && $siteStatusUpdate == true && $allocatedWorkUpdateStatus == true) {
						$this->dbAdapter->commit();
						$response['flag']     = true;
						$response['title']    = 'Deleted Successfully';
						$response['message']  = 'Site allocation has been deleted successfully.';
					} else {
						$this->dbAdapter->rollBack();
						$response['flag']     = false;
						$response['title']    = 'Error Deleting!';
						$response['message']  = 'Please try again after refreshing the page.';
					}
				} else {
					$response['flag'] = false;
					$response['title'] = 'Site ID Missing!';
					$response['message'] = 'Please try again after refreshing the page.';
				}
			} else {
				$response['flag'] = false;
				$response['title'] = 'Invalid Request Type!';
				$response['message'] = 'Please try again after refreshing the page.';
			}
		} catch(Exception $e){
			$response['flag'] = false;
			$response['title'] = 'Internal Server Error!';
			$response['message'] = $e->getMessage();
		}
		echo json_encode($response);
		exit;
	}
	public function ajaxSiteallocationAction()
	{
		$this->checklogin();    
		$params                = $this->view->params = $this->getRequest()->getParams();
		$this->view->totalnum  = $params['page'];
		$this->view->messages  = $this->_flashMessenger->getMessages();  
		if($params['order']){
			if($params['key'] == 'allocate_userid'){
				$ord .="order by vendor ".$params['order'].", allocate_user ".$params['order']."";
			}elseif($params['key'] == 'supervisor_id'){
				$ord .="order by supervisor ".$params['order']."";
			}elseif($params['key'] == 'due_date'){
				$ord .="order by DATE(s.due_date) ".$params['order']."";
			}elseif($params['key'] == 'created'){
				$ord .="order by DATE(s.created) ".$params['order']."";
			}elseif($params['key'] == 'status_name'){
				$ord .="order by status_name ".$params['order']."";
			}else{
				$ord .="order by s.".$params['key']." ".$params['order'].""; 
			}
		}else{
			$ord .="order by s.id desc";
		}
		$sql = "select  s.*, u.name as allocate_user, sup.name as supervisor, v.vendor_name as vendor, st.name as status_name  from  tbl_site_allocation as s 
		left join tbl_user as u on (s.allocate_userid = u.id)
		left join tbl_user as sup on (s.supervisor_id = sup.id)
		left join tbl_vendor as v on (s.allocate_userid = v.id)
		left join tbl_site_status as st on (s.status = st.status)
		where 1 $ord";
		$site_allcate_data =  $this->dbAdapter->fetchAll($sql);
		$page=$this->_getParam('page',1);
		$paginator = Zend_Paginator::factory($site_allcate_data);      
         $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
         $paginator->setItemCountPerPage(10); // number of items to show per page
         $this->view->paginator = $paginator;
         $this->view->totalrec = $paginator->getTotalItemCount(); 
         $this->getHelper('Layout')->disableLayout();
         if($params['order'] == 'DESC' && $params['key'] == 'po_no') 
         	{$this->view->po_no_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->zone_order = 'ASC';$this->view->cluster_order = 'ASC';$this->view->cluster_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         elseif($params['order'] == 'ASC' && $params['key'] == 'po_no'){ 
         	$this->view->po_no_order = 'DESC'; $this->view->site_id_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->zone_order = 'ASC';$this->view->cluster_order = 'ASC';$this->view->cluster_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         	if($params['order'] == 'DESC' && $params['key'] == 'site_id') 
         		{$this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->zone_order = 'ASC';$this->view->cluster_order = 'ASC';$this->view->cluster_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         	elseif($params['order'] == 'ASC' && $params['key'] == 'site_id'){ 
         		$this->view->site_id_order = 'DESC'; $this->view->po_no_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->zone_order = 'ASC';$this->view->cluster_order = 'ASC';$this->view->cluster_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         		if($params['order'] == 'DESC' && $params['key'] == 'infratel_id') 
         			{$this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC'; $this->view->zone_order = 'ASC';$this->view->cluster_order = 'ASC';$this->view->cluster_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         		elseif($params['order'] == 'ASC' && $params['key'] == 'infratel_id'){ 
         			$this->view->infratel_id_order = 'DESC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC'; $this->view->zone_order = 'ASC';$this->view->cluster_order = 'ASC';$this->view->cluster_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         			if($params['order'] == 'DESC' && $params['key'] == 'zone') 
         				{$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->cluster_order = 'ASC';$this->view->cluster_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         			elseif($params['order'] == 'ASC' && $params['key'] == 'zone'){ 
         				$this->view->zone_order = 'DESC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->cluster_order = 'ASC';$this->view->cluster_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         				if($params['order'] == 'DESC' && $params['key'] == 'cluster') 
         					{$this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->cluster_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         				elseif($params['order'] == 'ASC' && $params['key'] == 'cluster'){ 
         					$this->view->cluster_order = 'DESC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->cluster_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         					if($params['order'] == 'DESC' && $params['key'] == 'cluster_mobile') 
         						{$this->view->cluster_mobile_order = 'ASC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         					elseif($params['order'] == 'ASC' && $params['key'] == 'cluster_mobile'){ 
         						$this->view->cluster_mobile_order = 'DESC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         						if($params['order'] == 'DESC' && $params['key'] == 'tech_name') 
         							{$this->view->tech_name_order = 'ASC';$this->view->cluster_mobile_order = 'ASC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         						elseif($params['order'] == 'ASC' && $params['key'] == 'tech_name'){ 
         							$this->view->tech_name_order = 'DESC';$this->view->cluster_mobile_order = 'ASC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         							if($params['order'] == 'DESC' && $params['key'] == 'tech_mobile') 
         								{$this->view->tech_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->cluster_mobile_order = 'ASC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         							elseif($params['order'] == 'ASC' && $params['key'] == 'tech_mobile'){ 
         								$this->view->tech_mobile_order = 'DESC';$this->view->tech_name_order = 'ASC';$this->view->cluster_mobile_order = 'ASC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         								if($params['order'] == 'DESC' && $params['key'] == 'allocate_userid') 
         									{$this->view->allocate_userid_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->cluster_mobile_order = 'ASC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         								elseif($params['order'] == 'ASC' && $params['key'] == 'allocate_userid'){ 
         									$this->view->allocate_userid_order = 'DESC';$this->view->tech_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->cluster_mobile_order = 'ASC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         									if($params['order'] == 'DESC' && $params['key'] == 'supervisor_id') 
         										{$this->view->supervisor_id_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->cluster_mobile_order = 'ASC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         									elseif($params['order'] == 'ASC' && $params['key'] == 'supervisor_id'){ 
         										$this->view->supervisor_id_order = 'DESC';$this->view->allocate_userid_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->cluster_mobile_order = 'ASC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         										if($params['order'] == 'DESC' && $params['key'] == 'due_date') 
         											{$this->view->due_date_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->cluster_mobile_order = 'ASC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         										elseif($params['order'] == 'ASC' && $params['key'] == 'due_date'){ 
         											$this->view->due_date_order = 'DESC';$this->view->supervisor_id_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->cluster_mobile_order = 'ASC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->created_order = 'ASC';$this->view->status_name_order = 'ASC';}
         											if($params['order'] == 'DESC' && $params['key'] == 'created') 
         												{$this->view->created_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->cluster_mobile_order = 'ASC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->status_name_order = 'ASC';}
         											elseif($params['order'] == 'ASC' && $params['key'] == 'created'){ 
         												$this->view->created_order = 'DESC';$this->view->due_date_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->cluster_mobile_order = 'ASC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';$this->view->status_name_order = 'ASC';}
         												if($params['order'] == 'DESC' && $params['key'] == 'status_name') 
         													{$this->view->status_name_order = 'ASC';$this->view->created_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->cluster_mobile_order = 'ASC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';}
         												elseif($params['order'] == 'ASC' && $params['key'] == 'status_name'){ 
         													$this->view->status_name_order = 'DESC';$this->view->created_order = 'ASC';$this->view->due_date_order = 'ASC';$this->view->supervisor_id_order = 'ASC';$this->view->allocate_userid_order = 'ASC';$this->view->tech_mobile_order = 'ASC';$this->view->tech_name_order = 'ASC';$this->view->cluster_mobile_order = 'ASC'; $this->view->cluster_order = 'ASC';$this->view->zone_order = 'ASC'; $this->view->infratel_id_order = 'ASC'; $this->view->site_id_order = 'ASC'; $this->view->po_no_order = 'ASC';}

         												}

         												public function allocateSiteAction()
         												{
         													try {
         														$this->checklogin();  
         														$allocated_by_id = $this->id;
         														$this->view->messages  = $this->_flashMessenger->getMessages();
         														$this->view->stateList = $this->master_model->getStateNameMasterList();
         														$params = $this->getRequest()->getParams(); 
         														$poNumbersQuery = $this->dbAdapter->select()
         														->from("tbl_po_details", array("po_no"))
         														->where("status != 1")
         														->order("po_no desc");
         														$this->view->poNumbers = $poNumbersResult = $this->dbAdapter->fetchAll($poNumbersQuery);
         														$natureOfWorkQuery = $this->dbAdapter->select()
         														->from("tbl_nature_of_work", array("id","nature_of_work"))
         														->where("status = 1");
         														$this->view->natureOfWork = $natureOfWorkResult = $this->dbAdapter->fetchAll($natureOfWorkQuery);     
         														$userDetailsQuery = $this->dbAdapter->select()
         														->from(array('tbl_user'),array('*'))
         														->where("status = 1")
         														->where("role_type = 3")
         														->where("role = 15")
         														->order('name ASC');
         														$this->view->userDetails = $userDetailsResult  = $this->dbAdapter->fetchAll($userDetailsQuery);
         														if($this->getRequest()->isPost()) 
         														{
         															if (empty($params['state_id']) || $params['state_id'] == "") {
         																$params['error'] = "State Name Missing! Plase select state name.";
         																$this->view->params = $params;
         															} else if (empty($params['client_id']) || $params['client_id'] == "") {
         																$params['error'] = "Client Name Missing! Plase select client name.";
         																$this->view->params = $params;
         															} else if (empty($params['poNumber']) || $params['poNumber'] == "")
         															{
         																$params['error'] = "PO Number Missing! Plase select PO number.";
         																$this->view->params = $params;
         															} else if (empty($params['siteId']) || $params['siteId'] == ""){
         																$params['error'] = "Site ID Missing! Please select site ID.";
         																$this->view->params = $params;
         															} else if (empty($params['po_date']) || $params['po_date'] == "") {
         																$params['error'] = "PO Date Missing! Please try again refreshing the page.";
         																$this->view->params = $params;
         															} else if (empty($params['site_completion_date']) || $params['site_completion_date'] == "") {
         																$params['error'] = "Site Completion Date Missing! Please select site completion date.";
         																$this->view->params = $params;
         															} else {
         																$insertData  = array();
         																$insertData['state_id']                 = $params['state_id'];
         																$insertData['client_id']                 = $params['client_id'];
         																$insertData['po_no']                 = $params['poNumber'];
         																$insertData['po_date']               = $this->dateConverter($params['po_date']);
         																$insertData['site_id']               = $params['siteId'];
         																$insertData['infratel_id']           = $params['infratel_id'];
         																$insertData['district']              = $params['location'];
         																$insertData['zone']                  = $params['zone'];
         																$insertData['cluster']               = $params['cluster'];
         																$insertData['cluster_incharge']      = $params['cluster_incharge'];
         																$insertData['cluster_mobile']        = $params['cluster_mobile'];
         																$insertData['tech_name']             = $params['technician_name'];
         																$insertData['tech_mobile']           = $params['technician_mobile'];   
         																$insertData['latitude']              = $params['site_latitude'];   
         																$insertData['longitude']             = $params['site_longitude']; 
         																$insertData['allocated_by_userid']   = $allocated_by_id;  
         																$insertData['work_type']             = $params['work_type'];    
         																$insertData['due_date']              = $this->dateConverter($params['site_completion_date']);    
         																$insertData['created_at']            = date('Y-m-d H:i:s');
         																$insertData['created_by']            = $this->id;
         																$this->dbAdapter->insert('tbl_site_allocation', $insertData);
         																$site_allocation_id = $this->dbAdapter->lastInsertId();
         																$site_id = $params['siteId'];
         																$po_no = $params['poNumber'];
         																$status['status'] = '2';
         																$this->dbAdapter->update('tbl_po_sites', $status, array('site_id = ?'=>$site_id, 'po_no = ?'=>$po_no));
         																foreach ($params['nature_of_work'] as $key => $value) 
         																{
         																	$natureOfWorkData = array();
         																	$natureOfWorkData['site_id']              = $params['siteId'];
         																	$natureOfWorkData['site_allocation_id']   = $site_allocation_id;
         																	$natureOfWorkData['nature_of_work_id']    = $value;
         																	$natureOfWorkData['allocation_type']      = $params['resource_type'][$key];
         																	if ($params['vendor_id'][$key]) {
         																		$natureOfWorkData['vendor_id']          = $params['vendor_id'][$key];
         																	}
         																	$natureOfWorkData['supervisor_id']        = $params['supervisor_id'][$key];
         																	$natureOfWorkData['work_completion_date']      = $this->dateConverter($params['completion_date'][$key]);
         																	$natureOfWorkData['created_at']           = date('Y-m-d H:i:s');
         																	$natureOfWorkData['created_by']           = $this->id;
         																	$this->dbAdapter->insert('tbl_site_nature_of_work', $natureOfWorkData);
         																}
         																$this->_flashMessenger->addMessage(array("success"=>"Site ".$params['siteId']." has been allocated successfully."));
         																$this->_redirect('/siteallocation');
         															}
         														}
         													} catch(Exception $e){
         														echo $e->getMessage();
         														exit;
         													}
         												}
               /** 
                * This method shows perticular allocated site details
                * @params string allocation_id  
                */
               public function viewAllocatedSiteDetailsAction()
               {
               	try {
                  $this->checklogin(); // check weather user is logged in or not
                  $params = $this->getRequest()->getParams(); // gets the parameters
                  $allocatedSiteQuery = $this->dbAdapter->select()
                  ->from("tbl_site_allocation",array("po_no","site_id","po_date","due_date"))
                  ->where("md5(id) = ?",$params['allocation_id']);
                  $this->view->allocatedSite = $allocatedSiteResult = $this->dbAdapter->fetchRow($allocatedSiteQuery);
                  $allocatedSiteDetailsQuery = $this->dbAdapter->select()
                    ->from("tbl_site_nature_of_work as tsnow", array("*")) // database table
                    ->joinLeft("tbl_nature_of_work as tnow","tnow.id = tsnow.nature_of_work_id",array("tnow.nature_of_work")) // left join for nature of work
                    ->where("md5(site_allocation_id) = ?", $params['allocation_id']);
                    $allocatedSiteDetailsResult = $this->dbAdapter->fetchAll($allocatedSiteDetailsQuery);
                    if ($allocatedSiteDetailsResult) {
                    	$allocatedSiteDetailsArray = array();
                    	foreach ($allocatedSiteDetailsResult as $allocatedSite) {
                    		if ($allocatedSite['vendor_id'] != NULL) {
                    			$vendorNameQuery = $this->dbAdapter->select()
                    			->from("tbl_vendor", array("vendor_name","contact_person"))
                    			->where("id = ?", $allocatedSite['vendor_id']);
                    			$vendorNameResult = $this->dbAdapter->fetchRow($vendorNameQuery);
                    			$allocatedSite['vendor_name'] = $vendorNameResult['vendor_name'];
                    			$allocatedSite['vendor_contact_name'] = $vendorNameResult['contact_person'];
                    			array_push($allocatedSiteDetailsArray, $allocatedSite);
                    		} else {
                    			$supervisorNameQuery = $this->dbAdapter->select()
                    			->from("tbl_user", array("name"))
                    			->where("id = ?", $allocatedSite['supervisor_id']);
                    			$supervisorNameResult = $this->dbAdapter->fetchRow($supervisorNameQuery);
                    			$allocatedSite['supervisor_name'] = $supervisorNameResult['name'];
                    			array_push($allocatedSiteDetailsArray, $allocatedSite);
                    		}
                    	}
                    	$this->view->allocatedSiteDetails = $allocatedSiteDetailsArray;
                    }
                } catch(Exception $e){
                	echo $e->getMessage();
                	exit;
                }
                $this->_helper->layout()->disableLayout();
            }
            public function getSiteMatrixDetailsAction()
            {
            	try {
            		$this->checklogin();
            		$response = array();
            		$params = $this->getRequest()->getParams();
            		if ($this->getRequest()->isPost()) {
            			// $siteFinalDetailsArray = array();
            			 
            			$siteTechnicalDetailsQuery = $this->dbAdapter->select()->from('tbl_deployment as td', array('*'))
            			->joinLeft('tbl_location_mapping as tlm','tlm.infratel_site_id = td.infratel_id', array('*'))
            			->joinLeft('tbl_matrix as tm','tm.infratel_site_id = td.infratel_id', array('*'))
            			->where('td.site_id = ?', $params['site_id']);
            			$siteTechnicalDetailsResult = $this->dbAdapter->fetchRow($siteTechnicalDetailsQuery);
            			$response['flag'] = true;
            			$response['site_data'] = $siteTechnicalDetailsResult;

            			// if (!empty($params['site_id']) && $params['site_id'] != "") {
            			// 	$siteMatrixDetailsQuery = $this->dbAdapter->select()
            			// 	->from("tbl_matrix", array("*"))
            			// 	->where("site_id = ?", $params['site_id']);
            			// 	$siteMatrixDetailsResult = $this->dbAdapter->fetchRow($siteMatrixDetailsQuery);
            			// 	if ($siteMatrixDetailsResult) {
            			// 		$siteDeploymentDetailsQuery = $this->dbAdapter->select()
            			// 		->from("tbl_deployment", array("work_type","location"))
            			// 		->where("site_id = ?", $params['site_id']);
            			// 		$siteDeploymentDetailsResult = $this->dbAdapter->fetchRow($siteDeploymentDetailsQuery);
            			// 		if ($siteDeploymentDetailsResult) {
            			// 			$siteMatrixDeploymentArray = array_merge($siteDeploymentDetailsResult, $siteMatrixDetailsResult);
            			// 			$siteLatLongDetailsQuery = $this->dbAdapter->select()
            			// 			->from("tbl_location_mapping",array("latitude","longitude"))
            			// 			->where("infratel_site_id = ?", $siteMatrixDeploymentArray['infratel_site_id']);
            			// 			$siteLatLongDetailsResult = $this->dbAdapter->fetchRow($siteLatLongDetailsQuery);
            			// 			if ($siteLatLongDetailsResult) {
            			// 				$siteFinalDetailsArray = array_merge($siteLatLongDetailsResult, $siteMatrixDeploymentArray);
            			// 				$response['flag'] = true;
            			// 				$response['site_data'] = $siteFinalDetailsArray;
            			// 			} else {
            			// 				$response['flag'] = false;
            			// 				$response['title'] = "Data Not Found!";
            			// 				$response['message'] = "Site Latitude/Longitude details not found. Please update.";
            			// 			}
            			// 		} else {
            			// 			$response['flag'] = false;
            			// 			$response['title'] = "Data Not Found!";
            			// 			$response['message'] = "No deployment data found for this site ID.";
            			// 		}
            			// 	} else {
            			// 		$response['flag'] = false;
            			// 		$response['title'] = "Data Not Found!";
            			// 		$response['message'] = "No matrix data found for this site ID.";
            			// 	}
            		// } else {
            		// 	$response['flag'] = false;
            		// 	$response['title'] = "Site ID Missing!";
            		// 	$response['message'] = "Please select site ID.";
            		// }
            		} else {
            			$response['flag'] = false;
            			$response['title'] = "Invalid Request Type!";
            			$response['message'] = "Please try after refreshing the page.";
            		}
            	} catch(Exception $e){
            		$response['flag'] = false;
            		$response['title'] = "Internal Server Error!";
            		$response['message'] = $e->getMessage();
            	}
            	echo json_encode($response);
            	exit;
            }
            public function getSitesByPoNumberAction()
            {
            	try{
            		$response = array();
            		$params = $this->getRequest()->getParams();
            		if ($this->getRequest()->isPost()) {
            			$sitesQuery = $this->dbAdapter->select()
            			->from("tbl_po_sites", array("site_id"))
            			->where("po_no = ?", $params['po_number'])
            			->where('is_deleted = ?', 0)
            			->where("status = 2");
            			$sitesResult = $this->dbAdapter->fetchAll($sitesQuery);
            			$poDateQuery = $this->dbAdapter->select()
            			->from("tbl_po_details", array("order_date"))
            			->where("po_no = ?", $params['po_number']);
            			$poDateResult = $this->dbAdapter->fetchRow($poDateQuery);
            			if ($sitesResult) {
            				$response['flag'] = true;
            				$response['sites'] = $sitesResult;
            				$response['po_date'] = date('d/m/Y', strtotime($poDateResult['order_date']));
            			} else {
            				$response['flag'] = flase;
            				$response['message'] = "No Sites Found";
            			}
            		} else {
            			$response['flag'] = false;
            			$response['message'] = "Invalid Request !";
            		}
            	} catch(Exception $e){
            		$response['flag'] = false;
            		$response['message'] = $e->getMessage();
            	}
            	echo json_encode($response);
            	exit;
            }

            public function getSitesByPoNumberForAllocationAction()
            {
            	try{
            		$response = array();
            		$params = $this->getRequest()->getParams();
            		if ($this->getRequest()->isPost()) {
            			$sitesQuery = $this->dbAdapter->select()
            			->from("tbl_po_sites", array("site_id"))
            			->where("po_no like ?", $params['po_number'])
            			->where('is_deleted = ?', 0)
            			->where("status = 0");
            			$sitesResult = $this->dbAdapter->fetchAll($sitesQuery);
            			$poDateQuery = $this->dbAdapter->select()
            			->from("tbl_po_details", array("order_date"))
            			->where("po_no = ?", $params['po_number']);
            			$poDateResult = $this->dbAdapter->fetchRow($poDateQuery);
            			if ($sitesResult) {
            				$response['flag'] = true;
            				$response['sites'] = $sitesResult;
            				$response['po_date'] = date('d/m/Y', strtotime($poDateResult['order_date']));
            			} else {
            				$response['flag'] = flase;
            				$response['message'] = "No Sites Found";
            			}
            		} else {
            			$response['flag'] = false;
            			$response['message'] = "Invalid Request !";
            		}
            	} catch(Exception $e){
            		$response['flag'] = false;
            		$response['message'] = $e->getMessage();
            	}
            	echo json_encode($response);
            	exit;
            }
            public function getSiteAllocatedToDetailsAction()
            {
            	try {
            		$this->checklogin();
            		$response = array();
            		$params = $this->getRequest()->getParams();
            		if ($this->getRequest()->isPost()) {
            			if (!empty($params['site_id']) && $params['site_id'] != "" && $params['site_id'] != NULL) {
            				$allocatedSiteDetailsQuery = $this->dbAdapter->select()
            				->from("tbl_site_nature_of_work", array("distinct(supervisor_id) as allocated_to_id","vendor_id"))
            				->where("site_id = ?", $params['site_id']);
            				$allocatedSiteDetailsResult = $this->dbAdapter->fetchAll($allocatedSiteDetailsQuery);
            				if ($allocatedSiteDetailsResult) {
            					$allocatedSiteDetailsArray = array();
            					foreach ($allocatedSiteDetailsResult as $allocatedSite) {
            						if ($allocatedSite['vendor_id'] != NULL) {
            							$vendorNameQuery = $this->dbAdapter->select()
            							->from("tbl_vendor", array("vendor_name","contact_person"))
            							->where("id = ?", $allocatedSite['allocated_to_id']);
            							$vendorNameResult = $this->dbAdapter->fetchRow($vendorNameQuery);
            							$allocatedSite['vendor_name'] = $vendorNameResult['vendor_name'];
            							$allocatedSite['vendor_contact_name'] = $vendorNameResult['contact_person'];
            							array_push($allocatedSiteDetailsArray, $allocatedSite);
            						} else {
            							$supervisorNameQuery = $this->dbAdapter->select()
            							->from("tbl_user", array("name"))
            							->where("id = ?", $allocatedSite['allocated_to_id']);
            							$supervisorNameResult = $this->dbAdapter->fetchRow($supervisorNameQuery);
            							$allocatedSite['supervisor_name'] = $supervisorNameResult['name'];
            							array_push($allocatedSiteDetailsArray, $allocatedSite);
            						}
            					}
            					$options = '<option value="">Please Select</option>';
            					foreach ($allocatedSiteDetailsArray as $allocatedSiteDetails) {
            						if ($allocatedSiteDetails['vendor_id']) {
            							$options .= '<option value="'.$allocatedSiteDetails['allocated_to_id'].'-vendor">'.$allocatedSiteDetails['vendor_contact_name'].' (Vendor)</option>';
            						} else {
            							$options .= '<option value="'.$allocatedSiteDetails['allocated_to_id'].'-staff">'.$allocatedSiteDetails['supervisor_name'].' (Staff)</option>';
            						}
            					}
            					$materialSupplierListQuery = $this->dbAdapter->select()
            					->from('tbl_material_supplier', array('id','supplier_name'))
            					->where('status = 1');
            					$materialSupplierListResult = $this->dbAdapter->fetchAll($materialSupplierListQuery);
            					if ($materialSupplierListResult) {
            						$materialSupplierOptions = '';
            						foreach ($materialSupplierListResult as $materialSupplier) {
            							$materialSupplierOptions .= '<option value="'.$materialSupplier['id'].'-material supplier">'.ucwords(strtolower($materialSupplier['supplier_name'])).' (Material Supplier)</option>';
            						}
            					}
            					$materialSupplierList = array();
            					$response['flag'] = true;
            					$response['allocated_to_list'] = $options;
            					array_push($materialSupplierList, $options);
            					array_push($materialSupplierList, $materialSupplierOptions);
            					$response['material_supplier_list'] = $materialSupplierList;
            				} else {
            					$response['flag'] = false;
            					$response['title'] = "Data Not Found!";
            					$response['message'] = "Allocated work not found. Please allocate work.";
            				}
            			} else {
            				$response['flag'] = false;
            				$response['title'] = "Site ID Missing!";
            				$response['message'] = "Please select site ID.";
            			}
            		} else {
            			$response['flag'] = false;
            			$response['title'] = "Invalid Request Type!";
            			$response['message'] = "Please try again after refreshing the page.";
            		}
            	} catch(Exception $e){
            		$response['flag'] = false;
            		$response['title'] = "Internal Server Error!";
            		$response['message'] = $e->getMessage();
            	}
            	echo json_encode($response);
            	exit;
            }
            public function getAllocatedWorkByAllocatedToIdAction()
            {
            	try {
            		$this->checklogin();
            		$response = array();
            		$params = $this->getRequest()->getParams();
            		if ($this->getRequest()->isPost()) {
            			if (!empty($params['allocated_to_id']) && $params['allocated_to_id'] != "" && $params['allocated_to_id'] != NULL) {
            				$allocatedNatureOfWorkQuery = $this->dbAdapter->select()
            				->from("tbl_site_nature_of_work", array("nature_of_work_id"))
            				->joinLeft("tbl_nature_of_work","tbl_nature_of_work.id = tbl_site_nature_of_work.nature_of_work_id", array("nature_of_work"))
            				->where("supervisor_id = ?", $params['allocated_to_id']);
            				$allocatedNatureOfWorkResult = $this->dbAdapter->fetchAll($allocatedNatureOfWorkQuery);
            				if ($allocatedNatureOfWorkResult) {
            					$options = '<option value="">Please Select</option>';
            					foreach ($allocatedNatureOfWorkResult as $allocatedNatureOfWork) {
            						$options .= '<option value="'.$allocatedNatureOfWork['nature_of_work_id'].'">'.$allocatedNatureOfWork['nature_of_work'].'</option>';
            					}
            					$response['flag'] = true;
            					$response['allocated_work_list'] = $options;
            				} else {
            					$response['flag'] = false;
            					$response['title'] = "Data Not Found!";
            					$response['message'] = "Allocated work not found. Please allocate work.";
            				}
            			} else {
            				$response['flag'] = false;
            				$response['title'] = "Allocated To Missing!";
            				$response['message'] = "Please select allocated to.";
            			}
            		} else {
            			$response['flag'] = false;
            			$response['title'] = "Invalid Request Type!";
            			$response['message'] = "Please try again after refreshing the page.";
            		}
            	} catch(Exception $e){
            		$response['flag'] = false;
            		$response['title'] = "Internal Server Error!";
            		$response['message'] = $e->getMessage();
            	}
            	echo json_encode($response);
            	exit;
            }
            public function getAllocatedSitesByPoNumberAction()
            {
            	try {
            		$this->checklogin();
            		$response = array();
            		$params = $this->getRequest()->getParams();
            		if ($this->getRequest()->isPost()) {
            			if (!empty($params['po_number']) || $params['po_number'] != "") {
            				$allocatedSitesQuery = $this->dbAdapter->select()
            				->from("tbl_site_allocation", array("id","site_id"))
            				->where("po_no = ?", $params['po_number'])
            				->where("status = ?", 1);
            				$allocatedSitesResult = $this->dbAdapter->fetchAll($allocatedSitesQuery);
            				if ($allocatedSitesResult) {
            					$options = '<option value="">Please Select</option>';
            					foreach ($allocatedSitesResult as $allocatedSite) {
            						$options .= '<option value="'.$allocatedSite['site_id'].'">'.$allocatedSite['site_id'].'</option>';
            					}
            					$response['flag'] = true;
            					$response['allocated_sites'] = $options;
            				} else {
            					$response['flag'] = false;
            					$response['title'] = "Sites Not Found!";
            					$response['message'] = "Please allocate sites first then try.";
            				}
            			} else {
            				$response['flag'] = false;
            				$response['title'] = "PO Number Missing!";
            				$response['message'] = "Please try again refreshing the page.";
            			}
            		} else {
            			$response['flag'] = false;
            			$response['title'] = "Invalid Request Type!";
            			$response['message'] = "Please try again refreshing the page.";
            		}
            	} catch(Exception $e){
            		$response['flag'] = false;
            		$response['title'] = "Internal Server Error!";
            		$response['message'] = $e->getMessage();
            	}
            	echo json_encode($response);
            	exit;
            }
            public function getSiteListAction(){
            	$po_no =  $this->_getParam('po_no'); 
            	$sql_site_allocation = "select site_id from tbl_site_allocation where 1";
            	$site_allocation_list = $this->dbAdapter->fetchAll($sql_site_allocation);
            	$site_list_array = array();
            	foreach ($site_allocation_list as $value) {
            		array_push($site_list_array, "'".$value['site_id']."'");
            	}
            	$site_lists = implode(',', $site_list_array);
            	if($site_list_array){
            		$sql_po = "select site_id from tbl_deployment where po='".$po_no."' and site_id not in($site_lists) group by site_id";
            	}else{
            		$sql_po = "select site_id from tbl_deployment where po='".$po_no."' group by site_id";
            	}
            	$site_list_data = $this->dbAdapter->fetchAll($sql_po);
            	$site_list[] = array("value"=>"",'text'=>"Select Site Id");
            	foreach($site_list_data as $key){
            		$site_list[] = array("value"=>$key['site_id'],"text"=>$key['site_id']);
            	}
            	$this->getHelper('Layout')->disableLayout();
            	$this->getHelper('ViewRenderer')->setNoRender();
            	$this->getResponse()->setHeader('Content-Type', 'application/json');
            	echo json_encode(array('options'=>$site_list));
            	return; 
            }

            public function getDataAction()
            {
            	$this->checklogin(); 
            	$params = $this->getRequest()->getParams();
            	$sql = "select * from tbl_matrix where site_id='".$params['id']."'";

            	$this->view->martix_data = $martix_data = $this->dbAdapter->fetchRow($sql);  

            	$sql_district = "select location, work_type from tbl_deployment where site_id='".$params['id']."'";
            	$this->view->district = $district = $this->dbAdapter->fetchRow($sql_district);  

            	$sql_cooridnate = "select latitude, longitude from tbl_location_mapping where infratel_site_id='".$martix_data['infratel_site_id']."'";
            	$this->view->cooridnate = $cooridnate = $this->dbAdapter->fetchRow($sql_cooridnate);  

            	$this->getHelper('Layout')->disableLayout();
            } 
            public function viewSiteDataAction(){ 

            	$this->checklogin();
            	$params                = $this->view->params = $this->getRequest()->getParams();
         //$this->view->totalnum  = $params['page'];
            // echo "<pre>";
            // print_r($params);
            // echo "</pre>";exit;
            	$user                 = new Application_Model_User();
            	$this->view->site_data = $site_data  = $user->getsite_allcate_data_row($params['allocation_id']);

            	$this->view->nature_work_data = $nature_work_data  = $user->get_nature_work_data($params['allocation_id']);

            	$sql_site_images = "select * from tbl_site_image where md5(site_allocation_id)='".$params['allocation_id']."'";
            	$this->view->site_images = $site_images = $this->dbAdapter->fetchRow($sql_site_images); 

            	$this->view->messages  = $this->_flashMessenger->getMessages();   

            } 


            public function siteLocationAction(){
            	$this->checklogin();
            	$params = $this->getRequest()->getParams();              
            	$sql_site = "select * from tbl_location_mapping where md5(infratel_site_id)='".$params['infratel_id']."'";
            	$this->view->site = $site = $this->dbAdapter->fetchRow($sql_site); 

            	$sql_site_details = "select site_id, tech_name, tech_mobile from tbl_site_allocation where md5(infratel_id)='".$params['infratel_id']."'";
            	$this->view->site_details = $site_details = $this->dbAdapter->fetchRow($sql_site_details); 

       // $this->_helper->layout()->disableLayout();
            }

            public function getPoDateAction()
            {
            	$params = $this->getRequest()->getParams();
            	$po_no = $params['po_no'];
            	$user   = new Application_Model_User();
            	$user->getPoDate($po_no);

            }

            public function getSiteAllocationDetailsAction()
            {
            	try {
            		$this->checklogin();
            		$this->view->params = $params = $this->getRequest()->getParams();
            		$siteAllocationDetailsQuery = $this->dbAdapter->select()
            		->from('tbl_site_nature_of_work', array('site_id','nature_of_work_id', 'allocation_type','vendor_id','supervisor_id','work_completion_date','created_at'))
            		->joinLeft('tbl_nature_of_work','tbl_nature_of_work.id = tbl_site_nature_of_work.nature_of_work_id', array('tbl_nature_of_work.nature_of_work'))
            		->where('site_id = ?', $params['siteId']);
            		$siteAllocationDetailsResult = $this->dbAdapter->fetchAll($siteAllocationDetailsQuery);
            		$siteAllocationArray = array();
            		if ($siteAllocationDetailsResult) {
            			foreach ($siteAllocationDetailsResult as $allocatedSiteDetails) {
            				if ($allocatedSiteDetails['vendor_id'] != "" || $allocatedSiteDetails['vendor_id'] != NULL) {
            					$vendorNameQuery = $this->dbAdapter->select()
            					->from("tbl_vendor", array("vendor_name","contact_person"))
            					->where("id = ?", $allocatedSiteDetails['supervisor_id']);
            					$vendorNameResult = $this->dbAdapter->fetchRow($vendorNameQuery);
            					$allocatedSiteDetails['vendor_name'] = $vendorNameResult['vendor_name'];
            					$allocatedSiteDetails['supervisor_name'] = $vendorNameResult['contact_person'];
            					array_push($siteAllocationArray, $allocatedSiteDetails);
            				} else {
            					$supervisorNameQuery = $this->dbAdapter->select()
            					->from("tbl_user", array("name"))
            					->where("id = ?", $allocatedSiteDetails['supervisor_id']);
            					$supervisorNameResult = $this->dbAdapter->fetchRow($supervisorNameQuery);
            					$allocatedSiteDetails['supervisor_name'] = $supervisorNameResult['name'];
            					array_push($siteAllocationArray, $allocatedSiteDetails);
            				}
            			}
            		}
            		$this->view->allocatedSiteDetails = $siteAllocationArray;
            	} catch(Exception $e){
            		echo $e->getMessage();
            		exit;
            	}
            	$this->_helper->layout()->disableLayout();
            }
            
    public function siteCloseStatusAction()
    {
        try {
			$this->checklogin();
			$response = array();
			$params = $this->getRequest()->getParams();
			
			if ($this->getRequest()->isPost()) {
				if (empty($params['allocation_id']) || $params['allocation_id'] == "") {
					$response['flag'] = false;
					$response['title'] = "Site Allocation Id Missing!";
					$response['message'] = "Please try again after refreshing the page.";
				} elseif (empty($params['close_status']) || $params['close_status'] == "") {
					$response['flag'] = false;
					$response['title'] = "Status Missing!";
					$response['message'] = "Please select Status.";
				} else {
					$updateData = array();
					$updateData['close_status'] = $params['close_status'];
				// 	$updateData['po_completion_status'] = 1;
				// 	$updateData['remark'] = $params['remark'];
					$updateStatus = $this->dbAdapter->update('tbl_site_allocation', $updateData, array("id = ?" => $params['allocation_id']));
					if ($updateStatus) {
						$response['flag'] = true;
						$response['title'] = "Site Closed Successfully";
						$response['message'] = "Closed has been set successfully.";
					} else {
						$response['flag'] = false;
						$response['title'] = "Status Update Failed!";
						$response['message'] = "Please try again after refreshing the page.";
					}
				}
			} else {
				$response['flag'] = false;
				$response['title'] = "Invalid Request Type!";
				$response['message'] = "Please try again after refreshing the page.";
			}
		} catch (Exception $e) {
			$response['flag'] = false;
			$response['title'] = "Internal Server Error!";
			$response['message'] = $e->getMessage();
		}
		echo json_encode($response);
		exit;
    }

            public function dateConverter($date)
            {
            	$date1 = explode('/', $date);
            	$final_date = $date1['2']."-".$date1['1']."-".$date1['0']; 
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