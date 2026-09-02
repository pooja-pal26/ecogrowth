<?php
/**
* Logimetrix Techsolution Pvt. Ltd.
 * File Name   : UserController.php
 * File Description  : User Controller
 * Created By : Ajay Kumar
 * Created Date: 01 June 2017
 */

class MasterController extends Zend_Controller_Action
{
	var $dbAdapter;

	public function init()
	{
		/* Initialize action controller here */
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
		$this->master          = new Application_Model_Master();
	}


	/*------------------------METHODS-START : NATURE OF WORK----------------------------------*/
	public function natureOfWorkAction(){
		try {
			$this->checklogin();   
			$this->view->messages = $messages = $this->_flashMessenger->getMessages();
			$natureOfWorkQuery = $this->dbAdapter->select()
			->from("tbl_nature_of_work", array("id","nature_of_work","status"))
			->where("status = 1");
			$this->view->natrureOfWork = $natureOfWorkResult = $this->dbAdapter->fetchAll($natureOfWorkQuery);
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
	}
	public function addNatureOfWorkAction(){
		try {
			$this->checklogin(); 
			$response = array();
			$params = $this->getRequest()->getParams();
			if($this->getRequest()->isPost()) {
				if (empty($params['natureOfWork'] || $params['natureOfWork'] == "")) {
					$response['flag'] = false;
					$response['title'] = 'Nature of Work Missing!';
					$response['message'] = 'Please enter nature of work.';
				} else {
					$checkDuplicateData = $this->master->getNatureOfWork(array('natureOfWork' => $params['natureOfWork']));
					if ($checkDuplicateData) {
						$response['flag'] = false;
						$response['title'] = 'Duplicate Data Found!';
						$response['message'] = 'Entered Nature of Work already exists.';
					} else { 
						$insertData  = array();                                           
						$insertData['nature_of_work'] = trim($params['natureOfWork']);
						$this->dbAdapter->insert('tbl_nature_of_work', $insertData);
						$response['flag'] = true;
						$response['title'] = 'Saved Successfully';
						$response['message'] = 'Nature of Work has been saved successfully.';
					}
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
	public function editWorkAction(){
		try {
			$this->checklogin(); 
			$this->view->messages  = $this->_flashMessenger->getMessages();
			$params = $this->getRequest()->getParams();
			$natureOfWorkNameQuery = $this->dbAdapter->select()
			->from("tbl_nature_of_work", array("id","nature_of_work"))
			->where("md5(id) = ?", $params['work-id']);
			$this->view->natureOfWork = $natureOfWorkNameResult = $this->dbAdapter->fetchRow($natureOfWorkNameQuery);
			if($this->getRequest()->isPost()) 
			{
				$roleData  = array();         
				$roleData['nature_of_work'] = $params['natureOfWork'];                                   
				$this->dbAdapter->update('tbl_nature_of_work', $roleData,array('md5(id)=?'=>$params['work-id']));
				$this->_flashMessenger->addMessage(array("success"=>"Nature Of Work has been updated successfully."));
				$this->_redirect('/master');
			}
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
	}
	public function deleteWorkAction(){
		try {
			$response = array();
			$this->checklogin();
			$requestParams = $this->getRequest()->getParams();
			if($requestParams['id']!=''){
				$Data['status']    = '0';
				$where = array();
				$where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['id']);
				$this->dbAdapter->update('tbl_nature_of_work', $Data, $where);
				$response['flag'] = true;
				$response['message'] = "Work has been deleted successfully.";
			} else {
				$response['flag'] = false;
				$response['message'] = "Work ID is missing. Please try again.";
			}
			$this->_helper->viewRenderer->setNoRender(true);
			$this->_helper->layout()->disableLayout(); 
		} catch(Exception $e){
			$response['flag'] = false;
			$response['message'] = $e->getMessage();
		}
		echo json_encode($response);
		exit;
	} 

	/*------------------------METHODS-END : NATURE OF WORK----------------------------------*/

	/*------------------------METHODS-START : WORK MASTER----------------------------------*/

/*----------------------------------------------------------------------------------
|           METHOD START : COMPANY VENDOR MASTER DATA                             |
|-----------------------------------------------------------------------------------
*/
public function companyVendorListAction()
{
	try {
		$this->checklogin();
		$getCompanyVendorListQuery = $this->dbAdapter->select()
		->from('tbl_company_vendor_master', array('*'))
		->where('is_deleted = 0');
		$this->view->companyVendorList = $getCompanyVendorListResult = $this->dbAdapter->fetchAll($getCompanyVendorListQuery);
	} catch(Exception $e) {
		echo $e->getMessage();
		exit;
	}
}
public function addCompanyVendorAction()
{
	$this->checklogin();
}
public function saveCompanyVendorAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if (empty($params['company_vendor_name']) || $params['company_vendor_name'] == "") {
				$response['flag'] = false;
				$response['title'] = "Company Name Missing!";
				$response['message'] = "Please enter company name.";
			} else if (empty($params['contact_person_name']) || $params['contact_person_name'] == "") {
				$response['flag'] = false;
				$response['title'] = "Contact Person Missing!";
				$response['message'] = "Please enter contact person name.";
			} else if (empty($params['contact_number']) || $params['contact_number'] == "") {
				$response['flag'] = false;
				$response['title'] = "Contact Number Missing!";
				$response['message'] = "Please enter contact Number.";
			} else if (empty($params['pan_number']) || $params['pan_number'] == "") {
				$response['flag'] = false;
				$response['title'] = "PAN Number Missing!";
				$response['message'] = "Please enter PAN number.";
			} else {
				$checkDuplicatedDataQuery = $this->dbAdapter->select()
				->from('tbl_company_vendor_master', array('id'))
				->where('pan_number = ?', $params['pan_number']);
				$checkDuplicateDataResult = $this->dbAdapter->fetchRow($checkDuplicatedDataQuery);
				if ($checkDuplicateDataResult) {
					$response['flag'] = false;
					$response['title'] = "Duplicate Data Found!";
					$response['message'] = "Entered PAN number already exists.";
				} else {
					$insertData = array();
					$insertData['vendor_company_name']  = trim($params['company_vendor_name']);
					$insertData['contact_person_name']  = trim($params['contact_person_name']);
					$insertData['contact_number']       = trim($params['contact_number']);
					$insertData['pan_number']           = trim($params['pan_number']);
					if ($params['gst_number']) {
						$insertData['gst_number']         = trim($params['gst_number']);
					}
					if ($params['proprietor_name']) {
						$insertData['proprietor_name']    = trim($params['proprietor_name']);
					}
					if ($params['company_address']) {
						$insertData['company_address']    = trim($params['company_address']);
					}
					$insertData['created_by']           = $this->id;
					$insertData['created_at']           = date('Y-m-d H:i:s');
					$this->dbAdapter->insert('tbl_company_vendor_master', $insertData);
					$response['flag'] = true;
					$response['title'] = "Saved Successfully";
					$response['message'] = "Conpany Vendor has beed saved successfully.";
				}
			}
		} else {
			$response['flag'] = false;
			$response['title'] = "Invalid Request Type!";
			$response['message'] = "Please try again after refreshing the page.";
		}
	} catch(Exception $e) {
		$response['flag'] = false;
		$response['title'] = "Internal Server Error!";
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
public function viewCompanyVendorDetailsAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if (empty($params['company_id']) || $params['company_id'] == "") {
			$response['flag'] = false;
			$response['title'] = "Company ID Missing!";
			$response['message'] = "Please try again after refreshing the page.";
			echo json_encode($response);
			exit;
		} else {
			$getCompanyVendorDetailsQuery = $this->dbAdapter->select()
			->from('tbl_company_vendor_master', array('*'))
			->where('id = ?', $params['company_id']);
			$getCompanyVendorDetailsResult = $this->dbAdapter->fetchRow($getCompanyVendorDetailsQuery);
			if ($getCompanyVendorDetailsResult) {
				$this->view->companyDetails = $getCompanyVendorDetailsResult;
			} else {
				$response['flag'] = false;
				$response['title'] = "Company Not Found!";
				$response['message'] = "Please try again after refreshing the page.";
				echo json_encode($response);
				exit;
			}
		}
	} catch(Exception $e) {
		$response['flag'] = false;
		$response['title'] = "Internal Server Error!";
		$response['message'] = $e->getMessage();
		echo json_encode($response);
		exit;
	}
	$this->_helper->layout()->disableLayout();
}
public function deactivateActivateDeleteCompanyVendorAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if (empty($params['company_id']) || $params['company_id'] == "") {
				$response['flag'] = false;
				$response['title'] = "Company ID Missing!";
				$response['message'] = "Please try again after refreshing the page.";
			} else if (empty($params['type']) || $params['type'] == "") {
				$response['flag'] = false;
				$response['title'] = "Argument Type Missing!";
				$response['message'] = "Please try again after refreshing the page.";
			} else {
				$updateData = array();
				$where['id = ?'] = $params['company_id'];
				if ($params['type'] == "deactivate") {
					$updateData['is_active'] = "0";
				} else if ($params['type'] == "activate") {
					$updateData['is_active'] = "1";
				} else if ($params['type'] == "delete") {
					$updateData['is_deleted'] = "1";
					$updateData['is_active']  = "0";
				} else {
					$response['flag'] = false;
					$response['title'] = "Invalid Argument Type!";
					$response['message'] = "Please try again after refreshing the page.";
				}
				$updateData['updated_by'] = $this->id;
				$updateData['updated_at'] = date('Y-m-d H:i:s');
				$updateStatus = $this->dbAdapter->update('tbl_company_vendor_master', $updateData, $where);
				if ($updateStatus) {
					$response['flag'] = true;
					$response['title'] = ucwords(strtolower($params['type']))."d Successfully";
					$response['message'] = "Company vendor has been ".$params['type']."d successfully.";
				} else {
					$response['flag'] = false;
					$response['title'] = "Failed!";
					$response['message'] = "Please try again after refreshing the page.";
				}
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
/*----------------------------------------------------------------------------------
|           METHOD END : COMPANY VENDOR MASTER DATA                             |
|-----------------------------------------------------------------------------------
*/

/*----------------------------------------------------------------------------------
|           METHOD START : WORK FOR SITE OF MASTER DATA                                     |
|-----------------------------------------------------------------------------------
*/
public function workForSiteOfListAction()
{
	try {
		$this->checklogin();
		$getWorkForSiteOfQuery = $this->dbAdapter->select()
		->from('tbl_work_for_site_of_master', array('id','work_for_site_of_name','is_active'))
		->where('is_deleted = 0');
		$this->view->workForSiteOfList = $getWorkForSiteOfResult = $this->dbAdapter->fetchAll($getWorkForSiteOfQuery);
	} catch(Exception $e) {
		echo $e->getMessage();
		exit;
	}
}
public function addWorkForSiteOfAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['work_for'] == "" || empty($params['work_for'])) {
				$response['flag'] = false;
				$response['title'] = "Work For Missing!";
				$response['message'] = "Please enter work for site of.";
			} else {
				$checkDuplicateDataQuery = $this->dbAdapter->select()
				->from('tbl_work_for_site_of_master', array('id','work_for_site_of_name'))
				->where('work_for_site_of_name = ?', $params['work_for'])
				->where('is_active = 1')
				->where('is_deleted = 0');
				$checkDuplicateDataResult = $this->dbAdapter->fetchRow($checkDuplicateDataQuery); 
				if ($checkDuplicateDataResult) {
					$response['flag'] = false;
					$response['title'] = "Duplicate Data Found!";
					$response['message'] = "Entered work for site of already exists.";
				} else {
					$insertData = array();
					$insertData['work_for_site_of_name'] = trim($params['work_for']);
					$insertData['created_by'] = $this->id;
					$insertData['created_at'] = date('Y-m-d H:i:s');
					$this->dbAdapter->insert('tbl_work_for_site_of_master', $insertData);
					$response['flag'] = true;
					$response['title'] = "Saved Successfully";
					$response['message'] = "Work for site of has been saved successfully.";
				}
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
/*----------------------------------------------------------------------------------
|           METHOD END : WORK FOR SITE OF MASTER DATA                                     |
|-----------------------------------------------------------------------------------
*/
public function siteTypeAction()
{
	try {
		$this->checklogin();
		$getSiteTypeQuery = $this->dbAdapter->select()
		->from('tbl_site_type_master as tstm', array('id','site_type','is_active'))
		->joinLeft('tbl_work_for_site_of_master as twfsom','twfsom.id = tstm.work_for_id', array('work_for_site_of_name as work_for'))
		->where('tstm.is_deleted = 0');
		$this->view->siteTypeList = $getSiteTypeResult = $this->dbAdapter->fetchAll($getSiteTypeQuery);
		$getWorkForSiteOfListQuery = $this->dbAdapter->select()
		->from('tbl_work_for_site_of_master', array('id','work_for_site_of_name'))
		->where('is_active = 1');
		$this->view->workForSiteOfList = $getWorkForSiteOfListResult = $this->dbAdapter->fetchAll($getWorkForSiteOfListQuery);  
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function addSiteTypeAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['work_type'] == "" || empty($params['work_type'])) {
				$response['flag'] = false;
				$response['title'] = "Site Type Missing!";
				$response['message'] = "Please enter site type.";
			} else {
				$checkDuplicateDataQuery = $this->dbAdapter->select()
				->from('tbl_site_type_master', array('id','site_type'))
				->where('site_type = ?', $params['work_type'])
				->where('is_active = 1')
				->where('is_deleted = 0')
				->where('work_for_id = ?', $params['work_for_id']);
				$checkDuplicateDataResult = $this->dbAdapter->fetchRow($checkDuplicateDataQuery); 
				if ($checkDuplicateDataResult) {
					$response['flag'] = false;
					$response['title'] = "Duplicate Data Found!";
					$response['message'] = "Entered site type already exists.";
				} else {
					$insertData = array();
					$insertData['site_type']    = trim($params['work_type']);
					$insertData['work_for_id']  = trim($params['work_for_id']);
					$insertData['created_by']   = $this->id;
					$insertData['created_at']   = date('Y-m-d H:i:s');
					$this->dbAdapter->insert('tbl_site_type_master', $insertData);
					$response['flag'] = true;
					$response['title'] = "Saved Successfully";
					$response['message'] = "Site Type has been saved successfully.";
				}
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
public function deactivateActivateDeleteSiteTypeAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if (empty($params['work_type_id']) || $params['work_type_id'] == "") {
				$response['flag'] = false;
				$response['title'] = "Site Type ID Missing!";
				$response['message'] = "Please try again after refreshing the page.";
			} else if (empty($params['type']) || $params['type'] == "") {
				$response['flag'] = false;
				$response['title'] = "Argument Type Missing!";
				$response['message'] = "Please try again after refreshing the page.";
			} else {
				$updateData = array();
				$where['id = ?'] = $params['work_type_id'];
				if ($params['type'] == "deactivate") {
					$updateData['is_active'] = "0";
				} else if ($params['type'] == "activate") {
					$updateData['is_active'] = "1";
				} else if ($params['type'] == "delete") {
					$updateData['is_deleted'] = "1";
					$updateData['is_active']  = "0";
				} else {
					$response['flag'] = false;
					$response['title'] = "Invalid Argument Type!";
					$response['message'] = "Please try again after refreshing the page.";
				}
				$updateData['updated_by'] = $this->id;
				$updateData['updated_at'] = date('Y-m-d H:i:s');
				$updateStatus = $this->dbAdapter->update('tbl_site_type_master', $updateData, $where);
				if ($updateStatus) {
					$response['flag'] = true;
					$response['title'] = ucwords(strtolower($params['type']))."d Successfully";
					$response['message'] = "Site type has been ".$params['type']."d successfully.";
				} else {
					$response['flag'] = false;
					$response['title'] = "Failed!";
					$response['message'] = "Please try again after refreshing the page.";
				}
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
public function workByWorkTypeAction()
{
	try {
		$this->checklogin();
		$getWorkQuery = $this->dbAdapter->select()
		->from('tbl_work_master as twm', array('id','work_name','is_active'))
		->joinLeft('tbl_site_type_master as tstm','tstm.id = twm.work_type_id', array('site_type'))
		->joinLeft('tbl_work_for_site_of_master as twfsm','twfsm.id = twm.work_type_id', array('work_for_site_of_name'))
		->where('twm.is_deleted = 0');
		$this->view->workList = $getWorkResult = $this->dbAdapter->fetchAll($getWorkQuery);
    // $getWorkTypeQuery = $this->dbAdapter->select()
    // ->from('tbl_site_type_master', array('id','work_type'))
    // ->where('is_deleted = 0')
    // ->where('is_active = 1');
    // $this->view->workTypeList = $getWorkTypeResult = $this->dbAdapter->fetchAll($getWorkTypeQuery);
		$getWorkForSiteOfListQuery = $this->dbAdapter->select()
		->from('tbl_work_for_site_of_master', array('id','work_for_site_of_name'))
		->where('is_active = 1');
		$this->view->workForSiteOfList = $getWorkForSiteOfListResult = $this->dbAdapter->fetchAll($getWorkForSiteOfListQuery);  
	} catch(Exception $e) {
		echo $e->getMessage();
		exit;
	}
}
public function getWorkTypeBySiteTypeAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['work_for_id'] == "" || empty($params['work_for_id'])) {
				$response['flag'] = false;
				$response['title'] = "Work For Missing!";
				$response['message'] = "Please select site work for.";
			} else {
				$getSiteTypeListQuery = $this->dbAdapter->select()
				->from('tbl_site_type_master', array('id','site_type'))
				->where('is_active = 1')
				->where('work_for_id = ?', $params['work_for_id']);
				$getSiteTypeListResult = $this->dbAdapter->fetchAll($getSiteTypeListQuery);
				if ($getSiteTypeListResult) {
					$options = '<option value="">Select Site Type</option>';
					foreach ($getSiteTypeListResult as $siteType) {
						$options .= '<option value="'.$siteType['id'].'">'.$siteType['site_type'].'</option>';
					}
					$response['flag'] = true;
					$response['options'] = $options;
				} else {
					$response['flag'] = false;
					$response['title'] = "Data Not Found!";
					$response['message'] = "Please update data for selected site work for.";
				}
			}
		} else {
			$response['flag'] = false;
			$response['title'] = "Invalid Request Type!";
			$response['message'] = "Please try after refreshing the page.";
		}
	} catch(Exception $e) {
		$response['flag'] = false;
		$response['title'] = "Internal Server Error!";
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
public function addWorkAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if (empty($params['work_type_id']) || $params['work_type_id'] == "") {
				$response['flag'] = false;
				$response['title'] = "Work Type Missing!";
				$response['message'] = "Please select work type.";    
			} else if (empty($params['work_name']) || $params['work_name'] == ""){
				$response['flag'] = false;
				$response['title'] = "Work Name Missing!";
				$response['message'] = "Please enter work name.";
			} else if (empty($params['work_for_id']) || $params['work_for_id'] == ""){
				$response['flag'] = false;
				$response['title'] = "Work For Missing!";
				$response['message'] = "Please select site work for.";
			} else {
				$checkDuplicateDataQuery = $this->dbAdapter->select()
				->from('tbl_work_master', array('*'))
				->where('is_deleted = 0')
				->where('work_type_id = ?', $params['work_type_id'])
				//->where('work_for_id = ?', $params['work_for_id'])
				->where('work_name = ?', $params['work_name']);
				$checkDuplicateDataResult = $this->dbAdapter->fetchRow($checkDuplicateDataQuery);
				if ($checkDuplicateDataResult) {
					$response['flag'] = false;
					$response['title'] = "Duplicate Data Found!";
					$response['message'] = "Entered work name already exists.";
				} else {
					$insertData = array();
				//	$insertData['work_for_id']  = trim($params['work_for_id']);
					$insertData['work_type_id'] = trim($params['work_type_id']);
					$insertData['work_name']    = trim($params['work_name']);
					$insertData['created_by']   = $this->id;
					$insertData['created_at']   = date('Y-m-d H:i:s');
					$this->dbAdapter->insert('tbl_work_master', $insertData);
					$response['flag'] = true;
					$response['title'] = "Saved Successfully";
					$response['message'] = "Work name has been saved successfully.";
				}
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
public function deactivateActivateDeleteWorkAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if (empty($params['work_name_id']) || $params['work_name_id'] == "") {
				$response['flag'] = false;
				$response['title'] = "Work ID Missing!";
				$response['message'] = "Please try again after refreshing the page.";
			} else if (empty($params['type']) || $params['type'] == "") {
				$response['flag'] = false;
				$response['title'] = "Argument Type Missing!";
				$response['message'] = "Please try again after refreshing the page.";
			} else {
				$updateData = array();
				$where['id = ?'] = $params['work_name_id'];
				if ($params['type'] == "deactivate") {
					$updateData['is_active'] = "0";
				} else if ($params['type'] == "activate") {
					$updateData['is_active'] = "1";
				} else if ($params['type'] == "delete") {
					$updateData['is_deleted'] = "1";
					$updateData['is_active']  = "0";
				} else {
					$response['flag'] = false;
					$response['title'] = "Invalid Argument Type!";
					$response['message'] = "Please try again after refreshing the page.";
				}
				$updateData['updated_by'] = $this->id;
				$updateData['updated_at'] = date('Y-m-d H:i:s');
				$updateStatus = $this->dbAdapter->update('tbl_work_master', $updateData, $where);
				if ($updateStatus) {
					$response['flag'] = true;
					$response['title'] = ucwords(strtolower($params['type']))."d Successfully";
					$response['message'] = "Work name has been ".$params['type']."d successfully.";
				} else {
					$response['flag'] = false;
					$response['title'] = "Failed!";
					$response['message'] = "Please try again after refreshing the page.";
				}
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
public function workDescriptionAction()
{
	try {
		$this->checklogin();
		$getWorkDescriptionQuery = $this->dbAdapter->select()
		->from('tbl_work_description_master as twdm', array('id','work_description','aging_days','is_active'))
		->joinLeft('tbl_site_type_master as twtm','twtm.id = twdm.work_type_id', array('site_type'))
		->joinLeft('tbl_work_master as twm','twm.id = twdm.work_name_id', array('work_name'))
		->where('twdm.is_deleted = 0');
		$this->view->workDescriptionList = $getWorkDescriptionResult = $this->dbAdapter->fetchAll($getWorkDescriptionQuery);
		$getWorkTypeQuery = $this->dbAdapter->select()
		->from('tbl_site_type_master', array('id','site_type'))
		->where('is_deleted = 0')
		->where('is_active = 1');
		$this->view->workTypeList = $getWorkTypeResult = $this->dbAdapter->fetchAll($getWorkTypeQuery);
	} catch(Exception $e) {
		echo $e->getMessage();
		exit;
	}
}
public function addWorkDescriptionAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if (empty($params['work_type_id']) || $params['work_type_id'] == "") {
				$response['flag'] = false;
				$response['title'] = "Work Type Missing!";
				$response['message'] = "Please select work type."; 
			} else if (empty($params['work_name_id']) || $params['work_name_id'] == "") {
				$response['flag'] = false;
				$response['title'] = "Work Name Missing!";
				$response['message'] = "Please select work name."; 
			} else if (empty($params['work_description']) || $params['work_description'] == "") {
				$response['flag'] = false;
				$response['title'] = "Work Description Missing!";
				$response['message'] = "Please enter work description."; 
			} else if (empty($params['aging_days']) || $params['aging_days'] == "") {
				$response['flag'] = false;
				$response['title'] = "Work Aging Missing!";
				$response['message'] = "Please enter work aging days."; 
			} else {
				$checkDuplicateDataQuery = $this->dbAdapter->select()
				->from('tbl_work_description_master', array('id'))
				->where('work_description = ?', $params['work_description'])
				->where('is_deleted = 0');
				$checkDuplicateDataResult = $this->dbAdapter->fetchRow($checkDuplicateDataQuery);
				if ($checkDuplicateDataResult) {
					$response['flag'] = false;
					$response['title'] = "Duplicate Data Found!";
					$response['message'] = "Please check and enter valid work description."; 
				} else {
					$insertData = array();
					$insertData['work_type_id']     = trim($params['work_type_id']);
					$insertData['work_name_id']     = trim($params['work_name_id']);
					$insertData['work_description'] = trim($params['work_description']);
					$insertData['aging_days']       = trim($params['aging_days']);
					$insertData['created_by']       = $this->id;
					$insertData['created_at']       = date('Y-m-d H:i:s');
					$this->dbAdapter->insert('tbl_work_description_master', $insertData);
					$response['flag'] = true;
					$response['title'] = "Saved Successfully";
					$response['message'] = "Work description has been saved successfully.";
				}
			}
		} else {
			$response['flag'] = false;
			$response['title'] = "Internal Server Error!";
			$response['message'] = "Please try again after refreshing the page.";
		}
	} catch(Exception $e) {
		$response['flag'] = false;
		$response['title'] = "Internal Server Error!";
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
public function deactivateActivateDeleteWorkDescriptionAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if (empty($params['work_description_id']) || $params['work_description_id'] == "") {
				$response['flag'] = false;
				$response['title'] = "Work ID Missing!";
				$response['message'] = "Please try again after refreshing the page.";
			} else if (empty($params['type']) || $params['type'] == "") {
				$response['flag'] = false;
				$response['title'] = "Argument Type Missing!";
				$response['message'] = "Please try again after refreshing the page.";
			} else {
				$updateData = array();
				$where['id = ?'] = $params['work_description_id'];
				if ($params['type'] == "deactivate") {
					$updateData['is_active'] = "0";
				} else if ($params['type'] == "activate") {
					$updateData['is_active'] = "1";
				} else if ($params['type'] == "delete") {
					$updateData['is_deleted'] = "1";
					$updateData['is_active']  = "0";
				} else {
					$response['flag'] = false;
					$response['title'] = "Invalid Argument Type!";
					$response['message'] = "Please try again after refreshing the page.";
				}
				$updateData['updated_by'] = $this->id;
				$updateData['updated_at'] = date('Y-m-d H:i:s');
				$updateStatus = $this->dbAdapter->update('tbl_work_description_master', $updateData, $where);
				if ($updateStatus) {
					$response['flag'] = true;
					$response['title'] = ucwords(strtolower($params['type']))."d Successfully";
					$response['message'] = "Work description has been ".$params['type']."d successfully.";
				} else {
					$response['flag'] = false;
					$response['title'] = "Failed!";
					$response['message'] = "Please try again after refreshing the page.";
				}
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
/*----------------------------------------------------------------------------------
|           METHOD START : WORK NAME LIST BY WORK TYPE (AJAX REQUEST)              |
|-----------------------------------------------------------------------------------
*/
public function getWorkNameListByWorkTypeAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['work_type_id'] == "" || empty($params['work_type_id'])) {
				$response['flag'] = false;
				$response['title'] = "Work Type ID Missing!";
				$response['message'] = "Please try again after refreshing the page.";
			} else {
				$getWorkNameListQuery = $this->dbAdapter->select()
				->from('tbl_work_master', array('id','work_name'))
				->where('is_active = 1');
				$getWorkNameListResult = $this->dbAdapter->fetchAll($getWorkNameListQuery);
				if ($getWorkNameListResult) {
					$options = '';
					foreach ($getWorkNameListResult as $workNameList) {
						$options .= '<option value="'.$workNameList['id'].'">'.$workNameList['work_name'].'</option>';
					}
					$response['flag'] = true;
					$response['options'] = $options;
				} else {
					$response['flag'] = false;
					$response['title'] = "Data Not Found!";
					$response['message'] = "Please add work name.";
				}
			}
		} else {
			$response['flag'] = false;
			$response['title'] = "Invalid Request Type!";
			$response['message'] = "Please try again after refreshing the page.";
		}
	} catch(Exception $e) {
		$response['flag'] = false;
		$response['title'] = "Internal Server Error!";
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
/*----------------------------------------------------------------------------------
|           METHOD END : WORK NAME LIST BY WORK TYPE (AJAX REQUEST)                 |
|-----------------------------------------------------------------------------------
*/
/*----------------------------------------------------------------------------------
|           METHOD START : WORK DESCRIPTION LIST BY WORK NAME (AJAX REQUEST)        |
|-----------------------------------------------------------------------------------
*/
public function getWorkDescriptionListByWorkTypeAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['work_name_id'] == "" || empty($params['work_name_id'])) {
				$response['flag'] = false;
				$response['title'] = "Work Name Missing!";
				$response['message'] = "Please select work name.";
			} else {
				$getWorkNameListQuery = $this->dbAdapter->select()
				->from('tbl_work_description_master', array('id','work_description'))
				->where('is_active = 1');
				$getWorkNameListResult = $this->dbAdapter->fetchAll($getWorkNameListQuery);
				if ($getWorkNameListResult) {
					$options = '';
					foreach ($getWorkNameListResult as $workNameList) {
						$options .= '<option value="'.$workNameList['id'].'">'.$workNameList['work_description'].'</option>';
					}
					$response['flag'] = true;
					$response['options'] = $options;
				} else {
					$response['flag'] = false;
					$response['title'] = "Data Not Found!";
					$response['message'] = "Please add work description.";
				}
			}
		} else {
			$response['flag'] = false;
			$response['title'] = "Invalid Request Type!";
			$response['message'] = "Please try again after refreshing the page.";
		}
	} catch(Exception $e) {
		$response['flag'] = false;
		$response['title'] = "Internal Server Error!";
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
/*----------------------------------------------------------------------------------
|           METHOD END : WORK DESCRIPTION LIST BY WORK NAME (AJAX REQUEST)          |
|-----------------------------------------------------------------------------------
*/

/*------------------------METHODS-END : WORK MASTER----------------------------------*/

/*------------------------METHODS-START : CLIENT MASTER DATA----------------------------------*/
public function clientListAction()
{
	try {
		$this->checklogin();
		$this->view->stateList = $this->master->getStateNameMasterList();
		$clientsListQuery = $this->dbAdapter->select()
		->from('tbl_client_master', array('*'))
		->joinLeft('tbl_states','tbl_states.id = tbl_client_master.state_id', array('state_name'))
		->where('tbl_client_master.is_active != 2');
		$this->view->clients = $clientsListResult = $this->dbAdapter->fetchAll($clientsListQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function addClientNameAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['client_name'] == "" || empty($params['client_name'])) {
				$response['flag'] = false;
				$response['title'] = "Client Name Missing!";
				$response['message'] = "Please enter client name.";
			} else if ($params['state_id'] == "" || empty($params['state_id'])) {
				$response['flag'] = false;
				$response['title'] = "State Name Missing!";
				$response['message'] = "Please select state name.";
			} else if ($params['client_gst'] == "" || empty($params['client_gst'])) {
				$response['flag'] = false;
				$response['title'] = "GST Number Missing!";
				$response['message'] = "Please enter client GST number.";
			} else if ($params['client_billing_address'] == "" || empty($params['client_billing_address'])) {
				$response['flag'] = false;
				$response['title'] = "Billing Address Missing!";
				$response['message'] = "Please enter client billing address.";
			} else if ($params['client_shipping_address'] == "" || empty($params['client_shipping_address'])) {
				$response['flag'] = false;
				$response['title'] = "Shipping Address Missing!";
				$response['message'] = "Please enter client shipping address.";
			} else {
				$insertData = array();
				$insertData['state_id'] = trim($params['state_id']);
				$insertData['client_name'] = strtoupper(trim($params['client_name']));
				$insertData['client_gst'] = strtoupper(trim($params['client_gst']));
				$insertData['client_billing_address'] = strtoupper(trim($params['client_billing_address']));
				$insertData['client_shipping_address'] = strtoupper(trim($params['client_shipping_address']));
				if ($params['contact_number']) {
					$insertData['client_contact_number'] = trim($params['contact_number']);
				}
				$insertData['created_by'] = $this->id;
				$insertData['created_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->insert('tbl_client_master', $insertData);
				$response['flag'] = true;
				$response['title'] = "Saved Successfully";
				$response['message'] = "Client name has been saved successfully.";
			}
		} else {
			$response['flag'] = false;
			$response['title'] = "Invalid Form Submit!";
			$response['message'] = "Please try again after refreshing the page.";
		}
	} catch(Exception $e){
    $response['flag'] = false;
    $response['title'] = "Form Server Error!";
    $response['message'] = "Please try again after refreshing the page.";
}
	echo json_encode($response);
	exit;
}

/* Function to get client details by client id
 * @params client ID
 */
public function getClientDetailsAction()
{
	try {
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if (isset($params['client_id'])) {
				if (empty($params['client_id']) || $params['client_id'] == "") {
					$response['flag'] = false;
					$response['title'] = "Client Missing!";
					$response['message'] = "Please select client name.";
				} else {
					$clientDetails = $this->master->getClientDetailsById($params['client_id']);
					if (!$clientDetails || empty($clientDetails)) {
						$response['flag'] = false;
						$response['title'] = "Data Not Found!";
						$response['message'] = "Please update client details or select valid client.";
					} else {
						$response['flag'] = true;
						$response['clientDetails'] = $clientDetails;
					}
				}
			} else if (isset($params['state_id'])) {
				if (empty($params['state_id']) || $params['state_id'] == "") {
					$response['flag'] = false;
					$response['title'] = "State Missing!";
					$response['message'] = "Please select state name.";
				} else {
					$clientDetails = $this->master->getClientDetailsByStateId($params['state_id']);
					if (!$clientDetails || empty($clientDetails)) {
						$response['flag'] = false;
						$response['title'] = "Data Not Found!";
						$response['message'] = "Please update client details or select valid client.";
					} else {
						$response['flag'] = true;
						$response['clientDetails'] = $clientDetails;
					}
				}
			}
		} else {
			$response['flag'] = false;
			$response['title'] = "Invalid Request Type!";
			$response['message'] = "Please try again after refreshing the page.";
		}
	} catch(Exception $e) {
		$response['flag'] = false;
		$response['title'] = "Internal Server Error!";
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
public function activateDeactivateDeleteClientAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			$updateData = array();
			if (empty($params['type']) || $params['type'] == "") {
				$response['flag'] = false;
				$response['title'] = "Invalid Request Type!";
				$response['message'] = "Please try again after refreshing the page.";
			} else if (empty($params['client_id']) || $params['client_id'] == "") {
				$response['flag'] = false;
				$response['title'] = "Invalid Request Type!";
				$response['message'] = "Please try again after refreshing the page.";
			} else {
				$where = array();
				$where['id = ?'] = $params['client_id'];
				if ($params['type'] == "deactivate") {
					$updateData['is_active'] = '0';
				} else if ($params['type'] == "activate") {
					$updateData['is_active'] = '1';
				} else if ($params['type'] == "delete") {
					$updateData['is_active'] = '2';
				}
				$updateData['updated_by'] = $this->id;
				$updateData['updated_at'] = date('Y-m-d H:i:s');
				$updateStatus = $this->dbAdapter->update('tbl_client_master', $updateData, $where);
				if ($updateStatus) {
					if ($params['type'] == "deactivate") {
						$response['flag'] = true;
						$response['title'] = "Deactivated Successfully";
						$response['message'] = "Client has been dactivated successfully.";
					} else if ($params['type'] == "activate") {
						$response['flag'] = true;
						$response['title'] = "Activated Successfully";
						$response['message'] = "Client has been activated successfully.";
					} else if ($params['type'] == "delete") {
						$response['flag'] = true;
						$response['title'] = "Deleted Successfully";
						$response['message'] = "Client has been deleted successfully.";
					}
				} else { 
					$response['flag'] = false;
					$response['title'] = "Failed!";
					$response['message'] = "Please try again after refreshing the page.";
				}
			}
		} else {
			$response['flag'] = false;
			$response['title'] = "Invalid Request Type!";
			$response['message'] = "Please try again after refreshing the page.";
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['title'] = "Internal Server Error!";
		$response['message'] = "Please try again after refreshing the page.";
	}
	echo json_encode($response);
	exit;
}
/*------------------------METHODS-END : CLIENT MASTER DATA----------------------------------*/

/*------------------------METHODS-START : STATES----------------------------------*/
public function stateListAction(){
	try {
		$this->checklogin();   
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$statesNameListQuery = $this->dbAdapter->select()
		->from("tbl_states", array("id","state_name","state_code"))
		->where("is_active = 1");
		$this->view->statesNameList = $statesNameListResult = $this->dbAdapter->fetchAll($statesNameListQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function addStateNameAction(){
	try {
		$this->checklogin(); 
		$response = array();
		$params = $this->getRequest()->getParams();
		if($this->getRequest()->isPost()) {
			if ($params['state_name'] == "" || empty($params['state_name'])) {
				$response['flag'] = false;
				$response['title'] = "State Name Missing!";
				$response['message'] = "Please enter state name.";
			} else if ($params['state_code'] == "" || empty($params['state_code'])) {
				$response['flag'] = false;
				$response['title'] = "State Code Missing!";
				$response['message'] = "Please enter state code.";
			} else {
				$insertData  = array();                                           
				$insertData['state_name'] = trim(ucwords(strtolower($params['state_name'])));
				if ($params['state_code']) {
					$insertData['state_code'] = trim($params['state_code']);
				}
				$insertData['created_by'] = $this->id;
				$insertData['created_at'] = date('Y-m-d H:i:s');                                   
				$this->dbAdapter->insert('tbl_states', $insertData);
				$response['flag'] = true;
				$response['title'] = "Saved Successfully";
				$response['message'] = "State name has been added successfully.";
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
public function getStateNameAction()
{
	try {
		$this->checklogin(); 
		$params = $this->getRequest()->getParams();
		$stateNameQuery = $this->dbAdapter->select()
		->from("tbl_states", array("id","state_name","state_code"))
		->where("id = ?", $params['state_id']);
		$this->view->stateNameDetails = $stateNameDetailsNameResult = $this->dbAdapter->fetchRow($stateNameQuery);
		$this->_helper->layout()->disableLayout();
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function editStateNameAction(){
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if($this->getRequest()->isPost()) 
		{
			$updateData  = array();                                           
			$updateData['state_name'] = trim($params['state_name']);
			if ($params['state_code']) {
				$updateData['state_code'] = trim($params['state_code']);
			} else {
				$updateData['state_code'] = NULL;
			}
// 			$updateData['updated_at'] = date('Y-m-d H:i:s');                                    
			$this->dbAdapter->update('tbl_states', $updateData,array('md5(id)=?'=>$params['state-id']));
			$this->_flashMessenger->addMessage(array("success"=>"State Name has been updated successfully."));
			$this->_redirect('/master/state-list');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function deleteStateNameAction(){
	try {
		$response = array();
		$this->checklogin();
		$requestParams = $this->getRequest()->getParams();
		if($requestParams['id']!=''){
			$Data['is_active']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['id']);
			$this->dbAdapter->update('tbl_states', $Data, $where);
			$response['flag'] = true;
			$response['message'] = "State has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "State ID is missing. Please try again.";
		}
		$this->_helper->viewRenderer->setNoRender(true);
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
} 

/*------------------------METHODS-END : STATES----------------------------------*/

/*-------------------METHODS-START : MATERIAL SUPPLIERS (SITE EXPENSE)---------------------*/
public function materialSuppliersAction()
{
	try {
		$this->checklogin();
		$materialSuplliersListQuery = $this->dbAdapter->select()
		->from("tbl_material_supplier", array("id","supplier_name","supplier_gst","supplier_person_name","supplier_contact_number","status"))
		->where("status != 2");
		$this->view->materialSupplierList = $materialSupplierListResult = $this->dbAdapter->fetchAll($materialSuplliersListQuery);
	} catch(Expense $e){
		echo $e->getMessage();
		exit;
	}
}
public function addMaterialSupplierAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if (empty($params['materialSupplierName']) || $params['materialSupplierName'] == "") {
				$response['flag'] = false;
				$response['title'] = "Supplier Name Missing!";
				$response['message'] = "Please enter supplier name.";
			} else {
				$checkForDuplicateDataQuery = $this->dbAdapter->select()
				->from("tbl_material_supplier", array("supplier_name"))
				->where("supplier_name = ?", trim($params['materialSupplierName']));
				$checkForDuplicateDataResult = $this->dbAdapter->fetchAll($checkForDuplicateDataQuery);
				if ($checkForDuplicateDataResult) {
					$response['flag'] = false;
					$response['title'] = "Duplicate Data!";
					$response['message'] = "Entered supplier name already exists. Please enter different name.";
				} else {
					$insertData = array();
					$insertData['supplier_name']  = trim(strtoupper($params['materialSupplierName']));
					if (isset($params['materialSupplierGst']) && !empty($params['materialSupplierGst']) && $params['materialSupplierGst'] != "") {
						$insertData['supplier_gst']   = trim(strtoupper($params['materialSupplierGst']));
					}
					if (isset($params['materialSupplierContactPerson']) && !empty($params['materialSupplierContactPerson']) && $params['materialSupplierContactPerson'] != "") {
						$insertData['supplier_person_name']   = trim(strtoupper($params['materialSupplierContactPerson']));
					}
					if (isset($params['materialSupplierContactNumber']) && !empty($params['materialSupplierContactNumber']) && $params['materialSupplierContactNumber'] != "") {
						$insertData['supplier_contact_number']   = trim(strtoupper($params['materialSupplierContactNumber']));
					}
					$insertData['created_at'] = date('Y-m-d H:i:s');
					$insertData['created_by'] = $this->id;
					$this->dbAdapter->insert("tbl_material_supplier", $insertData);
					$response['flag'] = true;
					$response['title'] = "Saved Successfully";
					$response['message'] = "Material supplier has been saved successfully.";
				}
			}
		} else {
			$response['flag'] = false;
			$response['title'] = "Invalid Request Type!";
			$response['message'] = "Please try after refreshing the page.";
		}
	} catch(Expense $e){
		$response['flag'] = false;
		$response['title'] = "Internal Server Error!";
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
public function deactivateActivateDeleteMaterialSupplierAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if (!empty($params['type']) && !empty($params['material_supplier_id']) || ($params['type'] == "" && $params['material_supplier_id'] == "")) {
				$updateData = array();
				$title;
				$message;
				$where['id = ?'] = $params['material_supplier_id'];
				if ($params['type'] == "activate") {
					$updateData['status'] = '1';
					$title = 'Activated Successfully';
					$message = 'Material supplier has been activated successfully.';
				} else if ($params['type'] == "deactivate") {
					$updateData['status'] = '0';
					$title = 'Deactivated Successfully';
					$message = 'Material supplier has been deactivated successfully.';
				} else if ($params['type'] == "delete") {
					$updateData['status'] = '2';
					$title = 'Deleted Successfully';
					$message = 'Material supplier has been deleted successfully.';
				}
				$updateResult = $this->dbAdapter->update('tbl_material_supplier', $updateData, $where);
				if ($updateResult) {
					$response['flag'] = true;
					$response['title'] = $title;
					$response['message'] = $message;
				} else {
					$response['flag'] = false;
					$response['title'] = "Updation Failed!";
					$response['message'] = "Please try again after refreshing the page.";
				}
			} else {
				$response['flag'] = false;
				$response['title'] = "Required Parameters Missing!";
				$response['message'] = "Please try again after refreshing the page.";
			}
		} else {
			$response['flag'] = false;
			$response['title'] = "Invalid Request Type!";
			$response['message'] = "Please try again after refreshing the page.";
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['title'] = "Internal Sever Error!";
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
/*-------------------METHODS-END : MATERIAL SUPPLIERS (SITE EXPENSE)-----------------------*/

/*-------------------METHODS-START : TRANSPORTER LIST-----------------------*/
public function transporterListAction()
{
	try {
		$this->checklogin();
		$getTransporterListQuery = $this->dbAdapter->select()
		->from('tbl_transporter_master', array('*'))
		->where('is_deleted = 0');
		$this->view->transporterList = $getTransporterListResult = $this->dbAdapter->fetchAll($getTransporterListQuery);
	} catch(Exception $e) {
		echo $e->getMessage();
		exit;
	}
}
// Function to add new transporter
public function addTransporterAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			$insertData = array();
			if (!empty($params['contact_number']) && !is_numeric($params['contact_number'])) {
				$response['flag'] = false;
				$response['title'] = "Invalid Contact Number!";
				$response['message'] = "Please enter valid contact number.";
			} else if ($params['transporter_name'] == "" || empty($params['transporter_name'])) {
				$response['flag'] = false;
				$response['title'] = "Transporter Name Missing!";
				$response['message'] = "Please enter transporter name.";
			} else {
				$insertData['transporter_name'] = strtoupper(trim($params['transporter_name']));
				$insertData['transporter_contact_person'] = trim($params['contact_person']);
				$insertData['transporter_contact_number'] = trim($params['contact_number']);
				$insertData['transporter_gst_number'] = trim($params['gst_number']);
				$insertData['created_by'] = $this->id;
				$insertData['created_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->insert('tbl_transporter_master', $insertData);
				$response['flag'] = true;
				$response['title'] = "Saved Successfully";
				$response['message'] = "Transporter has been saved successfully.";
			}
		} else {
			$response['flag'] = false;
			$response['title'] = "Invalid Form Submit!";
			$response['message'] = "Please try again after refreshing the page.";
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['title'] = "Internal Server Error!";
		$response['message'] = "Please try again after refreshing the page.";
	}
	echo json_encode($response);
	exit;
}
// Function to deactivate, activate and delete transporter
public function activateDeactivateDeleteTransporterAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			$updateData = array();
			if (empty($params['type']) || $params['type'] == "") {
				$response['flag'] = false;
				$response['title'] = "Invalid Request Type!";
				$response['message'] = "Please try again after refreshing the page.";
			} else if (empty($params['transporter_id']) || $params['transporter_id'] == "") {
				$response['flag'] = false;
				$response['title'] = "Invalid Request Type!";
				$response['message'] = "Please try again after refreshing the page.";
			} else {
				$where = array();
				$where['id = ?'] = $params['transporter_id'];
				if ($params['type'] == "deactivate") {
					$updateData['is_active'] = '0';
				} else if ($params['type'] == "activate") {
					$updateData['is_active'] = '1';
				} else if ($params['type'] == "delete") {
					$updateData['is_deleted'] = '1';
					$updateData['is_active'] = '0';
				}
			 
				$updateStatus = $this->dbAdapter->update('tbl_transporter_master', $updateData, $where);
				if ($updateStatus) {
					$response['flag'] = true;
					$response['title'] = ucwords(strtolower($params['type']))."d Successfully";
					$response['message'] = "Transporter has been ".$params['type']."d successfully.";
				} else { 
					$response['flag'] = false;
					$response['title'] = "Failed!";
					$response['message'] = "Please try again after refreshing the page.";
				}
			}
		} else {
			$response['flag'] = false;
			$response['title'] = "Invalid Request Type!";
			$response['message'] = "Please try again after refreshing the page.";
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['title'] = "Internal Server Error!";
		$response['message'] = "Please try again after refreshing the page.";
	}
	echo json_encode($response);
	exit;
}
/*-------------------METHODS-END : TRANSPORTER LIST-----------------------*/

/*------------------------METHODS-START : EXPENSE TYPE MASTER----------------------------------*/
public function expenseTypeAction()
{
	try {
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$expenseTypeListQuery = $this->dbAdapter->select()
		->from("tbl_expense_type_master", array("*"))
		->where("status != 2");
		$this->view->expenseTypeList = $expenseTypeListResult = $this->dbAdapter->fetchAll($expenseTypeListQuery);
	} catch(Exception $e){
		echo $e->message();
		exit;
	}
}
public function addExpenseTypeAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		$insertData = array();
		if ($this->getRequest()->isPost()) {
			if ($params['expenseType'] == "") {
				$response['flag'] = false;
				$response['message'] = "Expense Type Missing! Please enter expense type.";
			} else { 
				$insertData['expense_type'] = $params['expenseType'];
				$insertData['created_at']   = date("y-m-d H:i:s");
				$insertData['created_by']   = $this->id;
				$this->dbAdapter->insert("tbl_expense_type_master", $insertData);
				$response['flag'] = true;
				$response['message'] = "Expense type has been saved successfully.";
			}
		} else {
			$response['flag'] = false;
			$response['message'] = "Invalid Request Type. Please try again.";
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
public function getExpenseTypeAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$getExpenseTypeQuery = $this->dbAdapter->select()
		->from("tbl_expense_type_master", array("id","expense_type"))
		->where("id = ?", $params['expense_type_id']);
		$this->view->expenseTypeDetails = $getExpenseTypeResult = $this->dbAdapter->fetchRow($getExpenseTypeQuery);
		$this->_helper->layout()->disableLayout();
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function editExpenseTypeAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		$updateData = array();
		if ($this->getRequest()->isPost()) {
			if ($params['expenseType'] == "") {
				$response['flag'] = false;
				$response['message'] = "Expense Type Missing! Please enter expense type.";
			} else { 
				$updateData['expense_type'] = $params['expenseType'];
				$updateData['updated_at']   = date("y-m-d H:i:s");
				$updateData['updated_by']   = $this->id;
				$this->dbAdapter->update("tbl_expense_type_master", $updateData, array("id = ?"=>$params['expense_type_id']));
				$response['flag'] = true;
				$response['message'] = "Expense type has been updated successfully.";
			}
		} else {
			$response['flag'] = false;
			$response['message'] = "Invalid Request Type. Please try again.";
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
public function deactivateActivateDeleteExpenseTypeAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		$updateData = array();
		$updateData['updated_at'] = date('Y-m-d H:i:s');
		$updateData['updated_by'] = $this->id;
		$where['id = ?'] = $params['expense_type_id'];
		if ($this->getRequest()->isPost()) {
			if ($params['type'] == "deactivate") {
				$updateData['status'] = "0";
				$this->dbAdapter->update("tbl_expense_type_master", $updateData, $where);
				$response['flag']     = true;
				$response['title']    = "Deactivated Successfully";
				$response['message']  = "Expense Type has been deactivated successfully."; 
			} else if ($params['type'] == "activate") {
				$updateData['status'] = "1";
				$this->dbAdapter->update("tbl_expense_type_master", $updateData, $where);
				$response['flag']     = true;
				$response['title']    = "Activated Successfully";
				$response['message']  = "Expense Type has been activated successfully."; 
			} else if ($params['type'] == "delete") {
				$updateData['status'] = "2";
				$this->dbAdapter->update("tbl_expense_type_master", $updateData, $where);
				$response['flag']     = true;
				$response['title']    = "Deleted Successfully";
				$response['message']  = "Expense Type has been deleted successfully."; 
			} else {
				$response['flag']     = false;
				$response['title']    = "Request Type Missing!";
				$response['message']  = "Request type not found. Please try after refreshing the page.";
			}
		} else {
			$response['flag']     = false;
			$response['title']    = "Invalid Request Type!";
			$response['message']  = "Please try after refreshing the page.";
		}
	} catch(Exception $e){
		$response['flag']     = false;
		$response['title']    = "Error";
		$response['message']  = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
/*------------------------METHODS-END : EXPENSE TYPE MASTER----------------------------------*/

/*------------------------METHODS-START : EXPENSE-IN TYPE MASTER----------------------------------*/
public function expenseInTypeAction()
{
	try {
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$expenseInTypeListQuery = $this->dbAdapter->select()
		->from("tbl_expense_in_type_master as teitm", array("*"))
		->joinLeft("tbl_expense_type_master as tetm","tetm.id = teitm.expense_type_id", array("tetm.expense_type"))
		->where("teitm.status != 2");
		$this->view->expenseInTypeList = $expenseInTypeListResult = $this->dbAdapter->fetchAll($expenseInTypeListQuery);
		$expenseTypeListQuery = $this->dbAdapter->select()
		->from("tbl_expense_type_master", array("id","expense_type"))
		->where("status != 2");
		$this->view->expenseTypeList = $expenseTypeListResult = $this->dbAdapter->fetchAll($expenseTypeListQuery);
	} catch(Exception $e){
		echo $e->message();
		exit;
	}
}
public function addExpenseInTypeAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		$insertData = array();
		if ($this->getRequest()->isPost()) {
			if ($params['expenseTypeId'] == "") {
				$response['flag'] = false;
				$response['message'] = "Expense Type Missing! Please enter expense type.";
			} else if ($params['expenseInType'] == "") {
				$response['flag'] = false;
				$response['message'] = "Expense In Type Missing! Please enter expense in type.";
			} else { 
				$insertData['expense_type_id'] = $params['expenseTypeId'];
				$insertData['expense_in_type'] = $params['expenseInType'];
				$insertData['created_at']   = date("y-m-d H:i:s");
				$insertData['created_by']   = $this->id;
				$this->dbAdapter->insert("tbl_expense_in_type_master", $insertData);
				$response['flag'] = true;
				$response['message'] = "Expense in type has been saved successfully.";
			}
		} else {
			$response['flag'] = false;
			$response['message'] = "Invalid Request Type. Please try again.";
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
public function getExpenseInTypeAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$expenseInTypeDetailsQuery = $this->dbAdapter->select()
		->from("tbl_expense_in_type_master", array("id","expense_type_id","expense_in_type"))
		->where("id = ?", $params['expense_in_type_id']);
		$this->view->expenseInTypeDetails = $expenseInTypeDetailsResult = $this->dbAdapter->fetchRow($expenseInTypeDetailsQuery);
		$getExpenseTypeQuery = $this->dbAdapter->select()
		->from("tbl_expense_type_master", array("id","expense_type"))
		->where("status = 1");
		$this->view->expenseTypeDetails = $getExpenseTypeResult = $this->dbAdapter->fetchAll($getExpenseTypeQuery);
		$this->_helper->layout()->disableLayout();
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function editExpenseInTypeAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		$updateData = array();
		if ($this->getRequest()->isPost()) {
			if ($params['expenseTypeId'] == "") {
				$response['flag'] = false;
				$response['message'] = "Expense Type Missing! Please enter expense type.";
			} else if ($params['expenseInType'] == "") {
				$response['flag'] = false;
				$response['message'] = "Expense In Type Missing! Please enter expense in type.";
			} else { 
				$updateData['expense_type_id'] = $params['expenseTypeId'];
				$updateData['expense_in_type'] = $params['expenseInType'];
				$updateData['updated_at']   = date("y-m-d H:i:s");
				$updateData['updated_by']   = $this->id;
				$this->dbAdapter->update("tbl_expense_in_type_master", $updateData, array("id = ?"=>$params['expenseInTypeId']));
				$response['flag'] = true;
				$response['message'] = "Expense in type has been updated successfully.";
			}
		} else {
			$response['flag'] = false;
			$response['message'] = "Invalid Request Type. Please try again.";
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
public function deactivateActivateDeleteExpenseInTypeAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		$updateData = array();
		$updateData['updated_at'] = date('Y-m-d H:i:s');
		$updateData['updated_by'] = $this->id;
		$where['id = ?'] = $params['expense_in_type_id'];
		if ($this->getRequest()->isPost()) {
			if ($params['type'] == "deactivate") {
				$updateData['status'] = "0";
				$this->dbAdapter->update("tbl_expense_in_type_master", $updateData, $where);
				$response['flag']     = true;
				$response['title']    = "Deactivated Successfully";
				$response['message']  = "Expense In Type has been deactivated successfully."; 
			} else if ($params['type'] == "activate") {
				$updateData['status'] = "1";
				$this->dbAdapter->update("tbl_expense_in_type_master", $updateData, $where);
				$response['flag']     = true;
				$response['title']    = "Activated Successfully";
				$response['message']  = "Expense In Type has been activated successfully."; 
			} else if ($params['type'] == "delete") {
				$updateData['status'] = "2";
				$this->dbAdapter->update("tbl_expense_in_type_master", $updateData, $where);
				$response['flag']     = true;
				$response['title']    = "Deleted Successfully";
				$response['message']  = "Expense In Type has been deleted successfully."; 
			} else {
				$response['flag']     = false;
				$response['title']    = "Request Type Missing!";
				$response['message']  = "Request type not found. Please try after refreshing the page.";
			}
		} else {
			$response['flag']     = false;
			$response['title']    = "Invalid Request Type!";
			$response['message']  = "Please try after refreshing the page.";
		}
	} catch(Exception $e){
		$response['flag']     = false;
		$response['title']    = "Error";
		$response['message']  = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
/*------------------------METHODS-END : EXPENSE-IN TYPE MASTER----------------------------------*/

/*------------------------METHODS-START : BANK NAME MASTER----------------------------------*/
public function bankListAction(){
	try {
		$this->checklogin();   
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$bankNameMasterListQuery = $this->dbAdapter->select()
		->from("tbl_bank_master", array("id","bank_name"))
		->where("is_active = 1");
		$this->view->bankNameMasterList = $bankNameMasterListResult = $this->dbAdapter->fetchAll($bankNameMasterListQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function addBankNameAction(){
	try {
		$this->checklogin(); 
		$params = $this->getRequest()->getParams();
		if($this->getRequest()->isPost()) {
			$insertData  = array();                                           
			$insertData['bank_name'] = trim(ucwords(strtolower($params['bank_name'])));
			$insertData['created_by'] = $this->id;
			$insertData['created_at'] = date('Y-m-d H:i:s');                                   
			$this->dbAdapter->insert('tbl_bank_master', $insertData);
			$this->_flashMessenger->addMessage(array("success"=>"Bank Name has been saved successfully."));
			$this->_redirect('/master/bank-list');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}


public function paymentModesAction(){
	try {
		$this->checklogin();   
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$paymentModesQuery = $this->dbAdapter->select()
		->from("tbl_payment_modes", array("id","payment_mode"))
		->where("is_active = 1");
		$this->view->payment_modes = $payment_modes = $this->dbAdapter->fetchAll($paymentModesQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function addPaymentModeAction(){
	try {
		$this->checklogin(); 
		$params = $this->getRequest()->getParams();
		if($this->getRequest()->isPost()) {
			$insertData  = array();                                           
			$insertData['payment_mode'] = trim(ucwords(strtolower($params['payment_mode'])));
			$insertData['created_at'] = date('Y-m-d H:i:s');                                   
			$this->dbAdapter->insert('tbl_payment_modes', $insertData);
			$this->_flashMessenger->addMessage(array("success"=>"Payment Mode has been saved successfully."));
			$this->_redirect('/master/payment-modes');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}


public function getPaymentModeAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$paymentModeQuery = $this->dbAdapter->select()
		->from("tbl_payment_modes", array("id","payment_mode"))
		->where("id = ?", $params['payment_mode_id']);
		$this->view->paymentModeDetails =  $this->dbAdapter->fetchRow($paymentModeQuery);
		$this->_helper->layout()->disableLayout();
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function editPaymentModeAction(){
	try {
		$this->checklogin(); 
		$params = $this->getRequest()->getParams();
		if($this->getRequest()->isPost()) 
		{
			$updateData  = array();                                           
			$updateData['payment_mode'] = $params['payment_mode'];
			$this->dbAdapter->update('tbl_payment_modes', $updateData,array('md5(id)=?'=>$params['payment-mode-id']));
			$this->_flashMessenger->addMessage(array("success"=>"Payment Mode has been updated successfully."));
			$this->_redirect('/master/payment-modes');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function deletePaymentModeAction(){
	try {
		$response = array();
		$this->checklogin();
		$requestParams = $this->getRequest()->getParams();
		if($requestParams['id']!=''){
			$Data['is_active']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['id']);
			$this->dbAdapter->update('tbl_payment_modes', $Data, $where);
			$response['flag'] = true;
			$response['message'] = "Payment mode has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Payment mode ID is missing. Please try again.";
		}
		$this->_helper->viewRenderer->setNoRender(true);
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
} 

public function getBankNameAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$bankNameQuery = $this->dbAdapter->select()
		->from("tbl_bank_master", array("id","bank_name"))
		->where("id = ?", $params['bank_id']);
		$this->view->bankNameDetails = $bankNameResult = $this->dbAdapter->fetchRow($bankNameQuery);
		$this->_helper->layout()->disableLayout();
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function editBankNameAction(){
	try {
		$this->checklogin(); 
		$params = $this->getRequest()->getParams();
		if($this->getRequest()->isPost()) 
		{
			$updateData  = array();                                           
			$updateData['bank_name'] = $params['bank_name'];
		//	$updateData['updated_at'] = date('Y-m-d H:i:s');                                    
			$this->dbAdapter->update('tbl_bank_master', $updateData,array('md5(id)=?'=>$params['bank-id']));
			$this->_flashMessenger->addMessage(array("success"=>"Bank Name has been updated successfully."));
			$this->_redirect('/master/bank-list');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function deleteBankNameAction(){
	try {
		$response = array();
		$this->checklogin();
		$requestParams = $this->getRequest()->getParams();
		if($requestParams['id']!=''){
			$Data['is_active']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['id']);
			$this->dbAdapter->update('tbl_bank_master', $Data, $where);
			$response['flag'] = true;
			$response['message'] = "Bank name has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Bank name ID is missing. Please try again.";
		}
		$this->_helper->viewRenderer->setNoRender(true);
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
} 


public function bankAccountsAction(){
	try {
		$this->checklogin();   
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$bankNameMasterListQuery = $this->dbAdapter->select()
		->from("tbl_bank_accounts", array("*"))
		->where("is_active = 1");
		$this->view->bank_accounts = $bank_accounts = $this->dbAdapter->fetchAll($bankNameMasterListQuery);

		$bankNameMasterListQuery = $this->dbAdapter->select()
		->from("tbl_bank_master", array("id","bank_name"))
		->where("is_active = 1");
		$this->view->bankNameMasterList = $bankNameMasterListResult = $this->dbAdapter->fetchAll($bankNameMasterListQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function addBankAccountAction(){
	try {
		$this->checklogin(); 
		$params = $this->getRequest()->getParams();
		if($this->getRequest()->isPost()) {
			$insertData  = array();                                           
			$insertData['bank_name'] = trim(ucwords(strtolower($params['bank_name'])));
			$insertData['bank_account_number'] = trim(ucwords(strtolower($params['bank_account_number'])));
			$insertData['bank_branch'] = trim(ucwords(strtolower($params['bank_branch'])));
			$insertData['bank_ifsc_code'] = trim(ucwords(strtolower($params['bank_ifsc_code'])));
			$insertData['account_holder_name'] = trim(ucwords(strtolower($params['account_holder_name'])));

			$insertData['created_at'] = date('Y-m-d H:i:s');                                   
			$this->dbAdapter->insert('tbl_bank_accounts', $insertData);
			$this->_flashMessenger->addMessage(array("success"=>"Bank Account has been saved successfully."));
			$this->_redirect('/master/bank-accounts');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}


public function getBankAccountAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$bankAccountQuery = $this->dbAdapter->select()
		->from("tbl_bank_accounts", array("*"))
		->where("id = ?", $params['bank_id']);
		$this->view->bankAccountDetails =  $this->dbAdapter->fetchRow($bankAccountQuery);

		$bankNameMasterListQuery = $this->dbAdapter->select()
		->from("tbl_bank_master", array("id","bank_name"))
		->where("is_active = 1");
		$this->view->bankNameMasterList = $bankNameMasterListResult = $this->dbAdapter->fetchAll($bankNameMasterListQuery);
		
		$this->_helper->layout()->disableLayout();
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function editBankAccountAction(){
	try {
		$this->checklogin(); 
		$params = $this->getRequest()->getParams();
		if($this->getRequest()->isPost()) 
		{
			$updateData  = array();                                           
			$updateData['bank_name'] = trim(ucwords(strtolower($params['bank_name'])));
			$updateData['bank_account_number'] = trim(ucwords(strtolower($params['bank_account_number'])));
			$updateData['bank_branch'] = trim(ucwords(strtolower($params['bank_branch'])));
			$updateData['bank_ifsc_code'] = trim(ucwords(strtolower($params['bank_ifsc_code'])));
			$updateData['account_holder_name'] = trim(ucwords(strtolower($params['account_holder_name'])));
			$this->dbAdapter->update('tbl_bank_accounts', $updateData,array('md5(id)=?'=>$params['bank-id']));
			$this->_flashMessenger->addMessage(array("success"=>"Bank Account has been updated successfully."));
			$this->_redirect('/master/bank-accounts');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function deleteBankAccountAction(){
	try {
		$response = array();
		$this->checklogin();
		$requestParams = $this->getRequest()->getParams();
		if($requestParams['id']!=''){
			$Data['is_active']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['id']);
			$this->dbAdapter->update('tbl_bank_accounts', $Data, $where);
			$response['flag'] = true;
			$response['message'] = "Payment mode has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Payment mode ID is missing. Please try again.";
		}
		$this->_helper->viewRenderer->setNoRender(true);
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
} 

/*------------------------METHODS-END : BANK NAME MASTER----------------------------------*/

/*------------------------METHODS-START : PRODUCTS----------------------------------*/
public function productListAction()
{
	try {
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$productsDetailsQuery = $this->dbAdapter->select()
		->from("tbl_products",array("*"))
		->joinLeft("tbl_product_type", "tbl_product_type.id = tbl_products.product_type_id", array("tbl_product_type.product_type_name"))
		->where("tbl_products.is_active = 1");
		$this->view->productDetails = $productsDetailsResult = $this->dbAdapter->fetchAll($productsDetailsQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function addNewProductAction()
{
	try{
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$params = $this->getRequest()->getParams();
		$unitQuery = $this->dbAdapter->select()->from('tbl_material_unit', array('*'))->where("is_active = 1");
		$this->view->unit = $unitResult = $this->dbAdapter->fetchAll($unitQuery);
		$productTypeQuery = $this->dbAdapter->select()->from('tbl_product_type', array('*'))->where("is_active = 1");
		$this->view->productType = $productTypeResult = $this->dbAdapter->fetchAll($productTypeQuery);
		if ($this->getRequest()->isPost()) {
			foreach ($params['product_category'] as $key => $value) {
				$data['product_type_id']  = $value;
				$data['product_name']   = $params['product_name'][$key];
				$data['unit']       = $params['unit'][$key];
				$data['price']        = $params['price'][$key];
				$data['created_at']     = date('Y-m-d H:i:s');
				$this->dbAdapter->insert('tbl_products', $data);
			}
			$this->_flashMessenger->addMessage(array("success"=>"Product has been saved successfully."));
			$this->_redirect('/master/product-list');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function editProductAction()
{
	try{
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$params = $this->getRequest()->getParams();
		$productDetailsQuery = $this->dbAdapter->select()
		->from("tbl_products",array("*"))
		->where("md5(id) = ?", $params['product-id'])
		->where("is_active = 1");
		$this->view->productDetails = $productsDetailsResult = $this->dbAdapter->fetchRow($productDetailsQuery); 
		$productUnitQuery = $this->dbAdapter->select()->from('tbl_material_unit', array('*'))->where("is_active = 1");
		$this->view->productUnit = $productUnitResult = $this->dbAdapter->fetchAll($productUnitQuery);
		$productTypeQuery = $this->dbAdapter->select()->from('tbl_product_type', array('*'))->where("is_active = 1");
		$this->view->productType = $productTypeResult = $this->dbAdapter->fetchAll($productTypeQuery);
		if ($this->getRequest()->isPost()) {
			$data['product_type_id']  = $params['product_category'];
			$data['product_name']     = $params['product_name'];
			$data['unit']             = $params['product_unit'];
			$data['price']            = $params['price'];
			$data['created_at']       = date('Y-m-d H:i:s');
			$this->dbAdapter->update('tbl_products', $data, array("md5(id) = ?"=>$params['product-id']));
			$this->_flashMessenger->addMessage(array("success"=>"Product has been updated successfully."));
			$this->_redirect('/master/product-list');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function deleteProductAction()
{
	try {
		$response = array();
		$this->checklogin();
		$requestParams = $this->getRequest()->getParams();
		if($requestParams['id']!=''){
			$Data['is_active']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['id']);
			$this->dbAdapter->update('tbl_products', $Data, $where);
			$response['flag'] = true;
			$response['message'] = "Product has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Product ID is missing. Please try again.";
		}
		$this->_helper->viewRenderer->setNoRender(true);
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
/*------------------------METHODS-END : PRODUCTS----------------------------------*/

/*------------------------VENDOR'S MASTER DATA START----------------------------------*/

/*------------------------METHOD-START : VENDOR EXPERIENCE----------------------------------*/

public function vendorExperienceMasterAction()
{
	try {
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$vendorExperienceMasterListQuery = $this->dbAdapter->select()
		->from("tbl_vendor_experience_master", array("*"))
		->where("is_active = 1");
		$this->view->vendorExperienceMaster = $vendorExperienceMasterListResult = $this->dbAdapter->fetchAll($vendorExperienceMasterListQuery);
	} catch(Exception $e){
		echo $this->getMessage();
		exit;
	}
}

public function addVendorExperienceAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['vendor_experience'] == "") {
				$params['error'] = "Vendor Experience Type! Please enter vendor experience type.";
				$this->view->params = $params;
			} else { 
				$insertData['experience'] = $params['vendor_experience'];
				$insertData['created_by'] = $this->id;
				$insertData['created_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->insert("tbl_vendor_experience_master", $insertData);
				$this->_flashMessenger->addMessage(array("success"=>"Vendor experience master has been saved successfully."));
				$this->_redirect("/master/vendor-experience-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function editVendorExperienceAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$vendorExperienceMasterDetailQuery = $this->dbAdapter->select()
		->from("tbl_vendor_experience_master", array("id","experience"))
		->where("md5(id) =?", $params['vendor-experience-master-id']);
		$this->view->vendorExperienceMasterDetail = $vendorExperienceMasterDetailResult = $this->dbAdapter->fetchRow($vendorExperienceMasterDetailQuery); 
		if ($this->getRequest()->isPost()) {
			if ($params['vendor_experience'] == "") {
				$params['error'] = "Vendor Experience Type! Please enter vendor experience type.";
				$this->view->params = $params;
			} else { 
				$insertData['experience'] = $params['vendor_experience'];
				$insertData['updated_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->update("tbl_vendor_experience_master", $insertData, array("md5(id) = ?"=>$params['vendor-experience-master-id']));
				$this->_flashMessenger->addMessage(array("success"=>"Vendor experience master has been updated successfully."));
				$this->_redirect("/master/vendor-experience-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function deleteVendorExperienceAction()
{
	try {
		$response = array();
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if($params['id']!=''){
			$Data['is_active']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $params['id']);
			$this->dbAdapter->update('tbl_vendor_experience_master', $Data, $where);
			$response['flag'] = true;
			$response['message'] = "Vendor experience master has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Vendor experience master ID is missing. Please try again.";
		}
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$params['flag'] = false;
		$params['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}

/*------------------------METHOD-END : VENDOR EXPERIENCE----------------------------------*/

/*------------------------METHOD-START : ORGANIZATION TYPE----------------------------------*/

public function organizationTypeMasterAction()
{
	try {
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$organizationTypeMasterQuery = $this->dbAdapter->select()
		->from("tbl_organization_type_master", array("*"))
		->where("is_active = 1");
		$this->view->organizationTypeMaster = $organizationTypeMasterResult = $this->dbAdapter->fetchAll($organizationTypeMasterQuery);
	} catch(Exception $e){
		echo $this->getMessage();
		exit;
	}
}

public function addOrganizationTypeMasterAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['organization_type'] == "") {
				$params['error'] = "Organization Type Missing! Please enter organization type.";
				$this->view->params = $params;
			} else { 
				$insertData['organization_type'] = $params['organization_type'];
				$insertData['created_by'] = $this->id;
				$insertData['created_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->insert("tbl_organization_type_master", $insertData);
				$this->_flashMessenger->addMessage(array("success"=>"Organization type master has been saved successfully."));
				$this->_redirect("/master/organization-type-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function editOrganizationTypeMasterAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$organizationTypeDetailQuery = $this->dbAdapter->select()
		->from("tbl_organization_type_master", array("id","organization_type"))
		->where("md5(id) =?", $params['organization-type-master-id']);
		$this->view->vendorExperienceMasterDetail = $vendorExperienceMasterDetailResult = $this->dbAdapter->fetchRow($organizationTypeDetailQuery); 
		if ($this->getRequest()->isPost()) {
			if ($params['organization_type'] == "") {
				$params['error'] = "Organization Type Missing! Please enter organization type.";
				$this->view->params = $params;
			} else { 
				$insertData['organization_type'] = $params['organization_type'];
				$insertData['updated_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->update("tbl_organization_type_master", $insertData, array("md5(id) = ?"=>$params['organization-type-master-id']));
				$this->_flashMessenger->addMessage(array("success"=>"Organization type master has been updated successfully."));
				$this->_redirect("/master/organization-type-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function deleteOrganizationTypeMasterAction()
{
	try {
		$response = array();
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if($params['id']!=''){
			$Data['is_active']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $params['id']);
			$this->dbAdapter->update('tbl_organization_type_master', $Data, $where);
			$response['flag'] = true;
			$response['message'] = "Organization type master has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Organization type master ID is missing. Please try again.";
		}
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$params['flag'] = false;
		$params['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}

/*------------------------METHOD-END : ORGANIZATION TYPE----------------------------------*/

/*------------------------METHOD-START : ASSOCIATION YEARS----------------------------------*/

public function associationYearsMasterAction()
{
	try {
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$associationYearsMasterQuery = $this->dbAdapter->select()
		->from("tbl_association_years_master", array("*"))
		->where("is_active = 1");
		$this->view->associationYearsMaster = $associationYearsMasterResult = $this->dbAdapter->fetchAll($associationYearsMasterQuery);
	} catch(Exception $e){
		echo $this->getMessage();
		exit;
	}
}

public function addAssociationYearsMasterAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['association_years'] == "") {
				$params['error'] = "Association Years Missing! Please enter association years.";
				$this->view->params = $params;
			} else { 
				$insertData['association_years'] = $params['association_years'];
				$insertData['created_by'] = $this->id;
				$insertData['created_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->insert("tbl_association_years_master", $insertData);
				$this->_flashMessenger->addMessage(array("success"=>"Association Years master has been saved successfully."));
				$this->_redirect("/master/association-years-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function editAssociationYearsMasterAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$associationiYearsDetailQuery = $this->dbAdapter->select()
		->from("tbl_association_years_master", array("id","association_years"))
		->where("md5(id) =?", $params['association-years-master-id']);
		$this->view->associationYearsMasterDetail = $associationYearsMasterDetailResult = $this->dbAdapter->fetchRow($associationiYearsDetailQuery); 
		if ($this->getRequest()->isPost()) {
			if ($params['association_years'] == "") {
				$params['error'] = "Association Years Missing! Please enter organization type.";
				$this->view->params = $params;
			} else { 
				$insertData['association_years'] = $params['association_years'];
				$insertData['updated_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->update("tbl_association_years_master", $insertData, array("md5(id) = ?"=>$params['association-years-master-id']));
				$this->_flashMessenger->addMessage(array("success"=>"Association years master has been updated successfully."));
				$this->_redirect("/master/association-years-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function deleteAssociationYearsMasterAction()
{
	try {
		$response = array();
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if($params['id']!=''){
			$Data['is_active']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $params['id']);
			$this->dbAdapter->update('tbl_association_years_master', $Data, $where);
			$response['flag'] = true;
			$response['message'] = "Association years master has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Association years master ID is missing. Please try again.";
		}
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$params['flag'] = false;
		$params['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}

/*------------------------METHOD-END : ASSOCIATION YEARS----------------------------------*/

/*------------------------METHOD-START GRAPHICAL PRESENCE----------------------------------*/

public function geographicalPresenceMasterAction()
{
	try {
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$geographicalPresenceMasterQuery = $this->dbAdapter->select()
		->from("tbl_vendor_geographical_presence_master", array("*"))
		->where("is_active = 1");
		$this->view->geographicalPresenceDetails = $geographicalPresenceMasterResult = $this->dbAdapter->fetchAll($geographicalPresenceMasterQuery);
	} catch(Exception $e){
		echo $this->getMessage();
		exit;
	}
}

public function addGeographicalPresenceMasterAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['geographical_presence'] == "") {
				$params['error'] = "Geographical Presence Missing! Please enter geographical presence.";
				$this->view->params = $params;
			} else { 
				$insertData['geographical_presence'] = trim($params['geographical_presence']);
				$insertData['created_by'] = $this->id;
				$insertData['created_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->insert("tbl_vendor_geographical_presence_master", $insertData);
				$this->_flashMessenger->addMessage(array("success"=>"Geographical Presence master has been saved successfully."));
				$this->_redirect("/master/geographical-presence-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function editGeographicalPresenceMasterAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$geographicalPresenseDetailQuery = $this->dbAdapter->select()
		->from("tbl_vendor_geographical_presence_master", array("id","geographical_presence"))
		->where("md5(id) =?", $params['geographical-presence-master-id']);
		$this->view->geographicalPresenceDetail = $geographicalPresenseDetailResult = $this->dbAdapter->fetchRow($geographicalPresenseDetailQuery); 
		if ($this->getRequest()->isPost()) {
			if ($params['geographical_presence'] == "") {
				$params['error'] = "Geographical Presence Missing! Please enter geographical presence.";
				$this->view->params = $params;
			} else { 
				$insertData['geographical_presence'] = trim($params['geographical_presence']);
				$insertData['updated_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->update("tbl_vendor_geographical_presence_master", $insertData, array("md5(id) = ?"=>$params['geographical-presence-master-id']));
				$this->_flashMessenger->addMessage(array("success"=>"Geographical Presence master has been updated successfully."));
				$this->_redirect("/master/geographical-presence-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function deleteGeographicalPresenceMasterAction()
{
	try {
		$response = array();
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if($params['id']!=''){
			$Data['is_active']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $params['id']);
			$this->dbAdapter->update('tbl_vendor_geographical_presence_master', $Data, $where);
			$response['flag'] = true;
			$response['message'] = "Geographical presence master has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Geographical presence master ID is missing. Please try again.";
		}
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$params['flag'] = false;
		$params['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}

/*------------------------METHOD-END : GRAPHICAL PRESENCE----------------------------------*/

/*------------------------METHOD-START : MAJOR CLIENTS ----------------------------------*/

public function majorClientsMasterAction()
{
	try {
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$majorClientsMasterQuery = $this->dbAdapter->select()
		->from("tbl_vendor_major_clients_master", array("*"))
		->where("is_active = 1");
		$this->view->majorClientsMaster = $majorClientsMasterResult = $this->dbAdapter->fetchAll($majorClientsMasterQuery);
	} catch(Exception $e){
		echo $this->getMessage();
		exit;
	}
}

public function addMajorClientsMasterAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['major_clients'] == "") {
				$params['error'] = "Major Clients Missing! Please enter major clients.";
				$this->view->params = $params;
			} else { 
				$insertData['major_clients'] = trim($params['major_clients']);
				$insertData['created_by'] = $this->id;
				$insertData['created_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->insert("tbl_vendor_major_clients_master", $insertData);
				$this->_flashMessenger->addMessage(array("success"=>"Major Clients master has been saved successfully."));
				$this->_redirect("/master/major-clients-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function editMajorClientsMasterAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$majorClientsDetailsQuery = $this->dbAdapter->select()
		->from("tbl_vendor_major_clients_master", array("id","major_clients"))
		->where("md5(id) =?", $params['major-clients-master-id']);
		$this->view->majorClientsDetails = $majorClientsDetailsResult = $this->dbAdapter->fetchRow($majorClientsDetailsQuery); 
		if ($this->getRequest()->isPost()) {
			if ($params['major_clients'] == "") {
				$params['error'] = "Major Clients Missing! Please enter major clients.";
				$this->view->params = $params;
			} else { 
				$insertData['major_clients'] = trim($params['major_clients']);
				$insertData['updated_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->update("tbl_vendor_major_clients_master", $insertData, array("md5(id) = ?"=>$params['major-clients-master-id']));
				$this->_flashMessenger->addMessage(array("success"=>"Major Clients master has been updated successfully."));
				$this->_redirect("/master/major-clients-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function deleteMajorClientsMasterAction()
{
	try {
		$response = array();
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if($params['id']!=''){
			$Data['is_active']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $params['id']);
			$this->dbAdapter->update('tbl_vendor_major_clients_master', $Data, $where);
			$response['flag'] = true;
			$response['message'] = "Major clients master has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Major clients master ID is missing. Please try again.";
		}
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$params['flag'] = false;
		$params['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}

/*------------------------METHOD-END : MAJOR CLIENTS----------------------------------*/

/*------------------------METHOD-START : TEAM STRENGTH ----------------------------------*/

public function teamStrengthMasterAction()
{
	try {
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$teamStrengthMasterQuery = $this->dbAdapter->select()
		->from("tbl_vendor_team_strength_master", array("*"))
		->where("is_active = 1");
		$this->view->teamStrengthMaster = $teamStrengthMasterResult = $this->dbAdapter->fetchAll($teamStrengthMasterQuery);
	} catch(Exception $e){
		echo $this->getMessage();
		exit;
	}
}

public function addTeamStrengthMasterAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['team_strength'] == "") {
				$params['error'] = "Team Strength Missing! Please enter team strength.";
				$this->view->params = $params;
			} else { 
				$insertData['team_strength'] = trim($params['team_strength']);
				$insertData['created_by'] = $this->id;
				$insertData['created_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->insert("tbl_vendor_team_strength_master", $insertData);
				$this->_flashMessenger->addMessage(array("success"=>"Team Strenght master has been saved successfully."));
				$this->_redirect("/master/team-strength-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function editTeamStrengthMasterAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$teamStrengthDetailsQuery = $this->dbAdapter->select()
		->from("tbl_vendor_team_strength_master", array("id","team_strength"))
		->where("md5(id) =?", $params['team-strength-master-id']);
		$this->view->teamStrengthDetails = $teamStrengthDetailsResult = $this->dbAdapter->fetchRow($teamStrengthDetailsQuery); 
		if ($this->getRequest()->isPost()) {
			if ($params['team_strength'] == "") {
				$params['error'] = "Team Strength Missing! Please enter team strength.";
				$this->view->params = $params;
			} else { 
				$insertData['team_strength'] = trim($params['team_strength']);
				$insertData['updated_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->update("tbl_vendor_team_strength_master", $insertData, array("md5(id) = ?"=>$params['team-strength-master-id']));
				$this->_flashMessenger->addMessage(array("success"=>"Team Strenght master has been updated successfully."));
				$this->_redirect("/master/team-strength-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function deleteTeamStrengthMasterAction()
{
	try {
		$response = array();
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if($params['id']!=''){
			$Data['is_active']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $params['id']);
			$this->dbAdapter->update('tbl_vendor_team_strength_master', $Data, $where);
			$response['flag'] = true;
			$response['message'] = "Team strenght master has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Team strenght master ID is missing. Please try again.";
		}
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$params['flag'] = false;
		$params['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}

/*------------------------METHOD-END : TEAM STRENGTH----------------------------------*/

/*------------------------METHOD-START : ANNUAL TURNOVER----------------------------------*/

public function annualTurnoverMasterAction()
{
	try {
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$annualTurnoverListQuery = $this->dbAdapter->select()
		->from("tbl_annual_turnover_master", array("*"))
		->where("is_active = 1");
		$this->view->annualTurnoverList = $annualTurnoverListResult = $this->dbAdapter->fetchAll($annualTurnoverListQuery);
	} catch(Exception $e){
		echo $this->getMessage();
		exit;
	}
}

public function addAnnualTurnoverMasterAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['annual_turnover'] == "") {
				$params['error'] = "Annual Turnover Missing! Please enter annual turnover.";
				$this->view->params = $params;
			} else { 
				$insertData['annual_turnover'] = trim($params['annual_turnover']);
				$insertData['created_by'] = $this->id;
				$insertData['created_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->insert("tbl_annual_turnover_master", $insertData);
				$this->_flashMessenger->addMessage(array("success"=>"Annual Turnover master has been saved successfully."));
				$this->_redirect("/master/annual-turnover-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function editAnnualTurnoverMasterAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$annualTurnoverDetailsQuery = $this->dbAdapter->select()
		->from("tbl_annual_turnover_master", array("id","annual_turnover"))
		->where("md5(id) =?", $params['annual-turnover-master-id']);
		$this->view->annualTurnoverDetails = $annualTurnoverDetailsResult = $this->dbAdapter->fetchRow($annualTurnoverDetailsQuery); 
		if ($this->getRequest()->isPost()) {
			if ($params['annual_turnover'] == "") {
				$params['error'] = "Annual Turnover Missing! Please enter annual turnover.";
				$this->view->params = $params;
			} else { 
				$insertData['annual_turnover'] = trim($params['annual_turnover']);
				$insertData['updated_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->update("tbl_annual_turnover_master", $insertData, array("md5(id) = ?"=>$params['annual-turnover-master-id']));
				$this->_flashMessenger->addMessage(array("success"=>"Annual Turnover master has been updated successfully."));
				$this->_redirect("/master/annual-turnover-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function deleteAnnualTurnoverMasterAction()
{
	try {
		$response = array();
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if($params['id']!=''){
			$Data['is_active']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $params['id']);
			$this->dbAdapter->update('tbl_annual_turnover_master', $Data, $where);
			$response['flag'] = true;
			$response['message'] = "Annual Turnover master has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Annual Turnover master ID is missing. Please try again.";
		}
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$params['flag'] = false;
		$params['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}

/*------------------------METHOD-END : ANNUAL TURNOVER----------------------------------*/

/*------------------------METHOD-START : WORK AMOUNT HANDLING----------------------------------*/

public function workHandlingAmountMasterAction()
{
	try {
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$workHandlingAmountListQuery = $this->dbAdapter->select()
		->from("tbl_work_handling_amount_master", array("*"))
		->where("is_active = 1");
		$this->view->workHandlingAmountList = $workHandlingAmountListResult = $this->dbAdapter->fetchAll($workHandlingAmountListQuery);
	} catch(Exception $e){
		echo $this->getMessage();
		exit;
	}
}

public function addWorkHandlingAmountMasterAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['work_handling_amount'] == "") {
				$params['error'] = "Work Handling Amount Missing! Please enter work handling amount.";
				$this->view->params = $params;
			} else { 
				$insertData['work_handling_amount'] = trim($params['work_handling_amount']);
				$insertData['created_by'] = $this->id;
				$insertData['created_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->insert("tbl_work_handling_amount_master", $insertData);
				$this->_flashMessenger->addMessage(array("success"=>"Work Handling Amount master has been saved successfully."));
				$this->_redirect("/master/work-handling-amount-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function editWorkHandlingAmountMasterAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$workHandlingAmountDetailsQuery = $this->dbAdapter->select()
		->from("tbl_work_handling_amount_master", array("id","work_handling_amount"))
		->where("md5(id) =?", $params['work-handling-amount-master-id']);
		$this->view->workHandlingAmountDetails = $workHandlingAmountDetailsResult = $this->dbAdapter->fetchRow($workHandlingAmountDetailsQuery); 
		if ($this->getRequest()->isPost()) {
			if ($params['work_handling_amount'] == "") {
				$params['error'] = "Work Handling Amount Missing! Please enter work handling amount.";
				$this->view->params = $params;
			} else { 
				$insertData['work_handling_amount'] = trim($params['work_handling_amount']);
				$insertData['updated_at'] = date('Y-m-d H:i:s');
				$this->dbAdapter->update("tbl_work_handling_amount_master", $insertData, array("md5(id) = ?"=>$params['work-handling-amount-master-id']));
				$this->_flashMessenger->addMessage(array("success"=>"Work Handling Amount master has been updated successfully."));
				$this->_redirect("/master/work-handling-amount-master");
			}
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

public function deleteWorkHandlingAmountMasterAction()
{
	try {
		$response = array();
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if($params['id']!=''){
			$Data['is_active']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $params['id']);
			$this->dbAdapter->update('tbl_work_handling_amount_master', $Data, $where);
			$response['flag'] = true;
			$response['message'] = "Work Handling Amount master has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Work Handling Amount master ID is missing. Please try again.";
		}
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$params['flag'] = false;
		$params['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}

/*------------------------METHOD-END : WORK AMOUNT HANDLING----------------------------------*/

/*------------------------VENDOR'S MASTER DATA END----------------------------------*/

/*------------------------METHODS-START : ROLE-MANAGER----------------------------------*/
public function employeeRolesListAction(){
	try {
		$this->checklogin();   
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$employeeRolesListQuery = $this->dbAdapter->select()
		->from("tbl_roles as tr", array("*"))
		->joinLeft("tbl_role_type as trt","trt.id = tr.role_type",array("role_type as role_type_name"))
		->where("tr.status != 2")
		->order("tr.role_type desc");
		$this->view->employeeRolesList = $employeeRolesListResult = $this->dbAdapter->fetchAll($employeeRolesListQuery);
		$roleTypeListQuery = $this->dbAdapter->select()
		->from("tbl_role_type", array("*"))
		->where("status = 1");
		$this->view->roleTypeList = $roleTypeListResult = $this->dbAdapter->fetchAll($roleTypeListQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function employeeRolesTypeListAction(){
	try {
		$this->checklogin();   
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$employeeRolesTypeListQuery = $this->dbAdapter->select()
		->from("tbl_role_type", array("*"))
		->where("status != 2");
		$this->view->employeeRolesTypeList = $employeeRolesTypeListResult = $this->dbAdapter->fetchAll($employeeRolesTypeListQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function addEmployeeRoleTypeAction(){
	try {
		$this->checklogin(); 
		$params = $this->getRequest()->getParams();
		if($this->getRequest()->isPost()) {
			$insertData  = array();                                           
			$insertData['role_type'] = trim(ucwords(strtolower($params['role_type'])));                                  
			$this->dbAdapter->insert('tbl_role_type', $insertData);
			$this->_flashMessenger->addMessage(array("success"=>"Role Type has been saved successfully."));
			$this->_redirect('/master/employee-roles-type-list');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function addEmployeeRoleNameAction(){
	try {
		$this->checklogin(); 
		$params = $this->getRequest()->getParams();
		if($this->getRequest()->isPost()) {
			$insertData = array();                                           
			$insertData['role']       = $params['role'];
			$insertData['role_type']  = $params['role_type_id'];                                  
			$this->dbAdapter->insert('tbl_roles', $insertData);
			$this->_flashMessenger->addMessage(array("success"=>"Employee Role Name has been saved successfully."));
			$this->_redirect('/master/employee-roles-list');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function getEmployeeRoleNameAction()
{
	try {
		$this->checklogin(); 
		$params = $this->getRequest()->getParams();
		$employeeRoleDetailsQuery = $this->dbAdapter->select()
		->from("tbl_roles", array("*"))
		->where("id = ?", $params['role_id']);
		$this->view->employeeRoleDetails = $employeeRoleDetailsResult = $this->dbAdapter->fetchRow($employeeRoleDetailsQuery);
		$roleTypeListQuery = $this->dbAdapter->select()
		->from("tbl_role_type", array("*"))
		->where("status = 1");
		$this->view->roleTypeList = $roleTypeListResult = $this->dbAdapter->fetchAll($roleTypeListQuery);
		$this->_helper->layout()->disableLayout();
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function getEmployeeRoleTypeAction()
{
	try {
		$this->checklogin(); 
		$params = $this->getRequest()->getParams();
		$employeeRoleTypeDetailsQuery = $this->dbAdapter->select()
		->from("tbl_role_type", array("*"))
		->where("id = ?", $params['role_type_id']);
		$this->view->employeeRoleTypeDetails = $employeeRoleTypeDetailsResult = $this->dbAdapter->fetchRow($employeeRoleTypeDetailsQuery);
		$this->_helper->layout()->disableLayout();
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function editEmployeeRoleTypeAction(){
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if($this->getRequest()->isPost()) 
		{
			$updateData  = array();                                           
			$updateData['role_type'] = trim(ucwords(strtolower($params['role_type'])));
			$this->dbAdapter->update('tbl_role_type', $updateData,array('md5(id)=?'=>$params['role-type-id']));
			$this->_flashMessenger->addMessage(array("success"=>"Role Type has been updated successfully."));
			$this->_redirect('/master/employee-roles-type-list');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function editEmployeeRoleNameAction(){
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		if($this->getRequest()->isPost()) 
		{
			$updateData  = array();                                           
			$updateData['role']       = $params['role'];
			$updateData['role_type']  = $params['role_type_id'];                                  
			$this->dbAdapter->update('tbl_roles', $updateData,array('md5(id)=?'=>$params['role-id']));
			$this->_flashMessenger->addMessage(array("success"=>"Employee Role Name has been updated successfully."));
			$this->_redirect('/master/employee-roles-list');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function activateDeactivateDeleteEmployeeRoleNameAction(){
	try {
		$response = array();
		$this->checklogin();
		$requestParams = $this->getRequest()->getParams();
		$where = array();
		$where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['id']);
		if($requestParams['id'] != '' && $requestParams['type'] == "deactivate"){
			$Data['status']    = '0';
			$this->dbAdapter->update('tbl_roles', $Data, $where);
			$response['flag'] = true;
			$response['title'] = "Deactivated";
			$response['message'] = "Role has been deactivated successfully.";
		} else if ($requestParams['id'] != '' && $requestParams['type'] == "activate") {
			$Data['status']    = '1';
			$this->dbAdapter->update('tbl_roles', $Data, $where);
			$response['flag'] = true;
			$response['title'] = "Activated";
			$response['message'] = "Role has been activated successfully.";
		} else if ($requestParams['id'] != '' && $requestParams['type'] == "delete") {
			$Data['status']    = '2';
			$this->dbAdapter->update('tbl_roles', $Data, $where);
			$response['flag'] = true;
			$response['title'] = "Deleted";
			$response['message'] = "Role has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['title'] = "Failed !";
			$response['message'] = "Role ID is missing. Please try again.";
		}
		$this->_helper->viewRenderer->setNoRender(true);
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
} 
public function activateDeactivateDeleteEmployeeRoleTypeAction(){
	try {
		$response = array();
		$this->checklogin();
		$requestParams = $this->getRequest()->getParams();
		$where = array();
		$where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['id']);
		if($requestParams['id'] != '' && $requestParams['type'] == "deactivate"){
			$Data['status']    = '0';
			$this->dbAdapter->update('tbl_role_type', $Data, $where);
			$response['flag'] = true;
			$response['title'] = "Deactivated";
			$response['message'] = "Role Type has been deactivated successfully.";
		} else if ($requestParams['id'] != '' && $requestParams['type'] == "activate") {
			$Data['status']    = '1';
			$this->dbAdapter->update('tbl_role_type', $Data, $where);
			$response['flag'] = true;
			$response['title'] = "Activated";
			$response['message'] = "Role Type has been activated successfully.";
		} else if ($requestParams['id'] != '' && $requestParams['type'] == "delete") {
			$Data['status']    = '2';
			$this->dbAdapter->update('tbl_role_type', $Data, $where);
			$response['flag'] = true;
			$response['title'] = "Deleted";
			$response['message'] = "Role Type has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['title'] = "Failed !";
			$response['message'] = "Role ID is missing. Please try again.";
		}
		$this->_helper->viewRenderer->setNoRender(true);
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
} 

/*------------------------METHODS-END : ROLE-MANAGER----------------------------------*/



/*------------------------METHODS-START : SUPPLIER----------------------------------*/
public function supplierListAction()
{
	$this->checklogin();
	try{
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$supplierListQuery = $this->dbAdapter->select()->from('tbl_suppliers', array('*'))->where('is_active=?','1');
		$this->view->supplierList = $supplierListResult = $this->dbAdapter->fetchAll($supplierListQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function addSupplierAction()
{
	$this->checklogin();
	try{
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			$dataArray['name']              = trim($params['supplier_name']);
			$dataArray['address']           = trim($params['address']);
			$dataArray['contact_1']         = $params['mobile_no'];
			if ($params['alternate_mobie'] != "") {
				$dataArray['contact_2']       = $params['alternate_mobie'];
			}      
			$dataArray['gst_number']        = trim(strtoupper($params['gst_no']));
			$dataArray['created_at']        = date('Y-m-d H:i:s');
			$this->dbAdapter->insert('tbl_suppliers', $dataArray);
			$this->_flashMessenger->addMessage(array("success"=>"Supplier has been added successfully."));
			$this->_redirect('/master/supplier-list');
		}
	} catch(Exception $e){
		echo $e->getMessages();
		exit;
	}
}
public function editSupplierAction()
{
	$this->checklogin();
	try{
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$params = $this->getRequest()->getParams();
		$supplierDetailsQuery = $this->dbAdapter->select()->from('tbl_suppliers', array('*'))->where('md5(id)=?', $params['datacode']);
		$this->view->supplierDetails = $supplierDetailsResult = $this->dbAdapter->fetchRow($supplierDetailsQuery);
		if ($this->getRequest()->isPost()) {
			$where['md5(id)=?']         = $params['datacode'];
			$dataArray['name']          = trim($params['supplier_name']);
			$dataArray['address']       = trim($params['address']);
			$dataArray['contact_1']     = $params['mobile_no'];
			$dataArray['contact_2']     = $params['alternate_mobie'];
			$dataArray['gst_number']    = trim(strtoupper($params['gst_no']));
			$dataArray['updated_at']    = date('Y-m-d H:i:s');
			$this->dbAdapter->update('tbl_suppliers', $dataArray, $where);
			$this->_flashMessenger->addMessage(array("success"=>"Supplier details has been updated successfully."));
			$this->_redirect('/master/supplier-list');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function deleteSupplierAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($params['id'] != "") {
			$updateData = array();
			$updateData['is_active'] = "0";
			$updateData['updated_at'] = date('Y-m-d H:i:s');
			$this->dbAdapter->update("tbl_suppliers", $updateData, array("id = ?"=>$params['id']));
			$response['flag'] = true;
			$response['message'] = $params['name']." has been deleted from supplier list.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Supplier ID missing. Please try again.";
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
/*------------------------METHODS-END : SUPPLIER----------------------------------*/

/*------------------------METHODS-START : PRODUCT TYPE----------------------------------*/
public function productTypeAction()
{
	$this->checklogin();
	try{
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$productListQuery = $this->dbAdapter->select()->from('tbl_product_type', array('*'))->where('is_active=?','1');
		$this->view->productlist = $productlist = $this->dbAdapter->fetchAll($productListQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function addProductTypeAction()
{
	try {
		$this->checklogin(); 
		$this->view->messages  = $this->_flashMessenger->getMessages();
		$this->view->params = $params = $this->getRequest()->getParams(); 
		if($this->getRequest()->isPost()) {
			$taskData  = array();                                           
			$taskData['product_type_name']    = $params['productType']; 
			$this->dbAdapter->insert('tbl_product_type', $taskData);
			$this->_flashMessenger->addMessage(array("success"=>"Product type has been saved successfully."));
			$this->_redirect('/master/product-type');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function editProductTypeAction(){
	$this->checklogin(); 
	$this->view->messages  = $this->_flashMessenger->getMessages();
	$params = $this->getRequest()->getParams(); 
	$productTypeQuery = "SELECT * FROM tbl_product_type WHERE md5(id) = '".$params['product-type-id']."' ";
	$this->view->productType = $productTypeResult = $this->dbAdapter->fetchRow($productTypeQuery);
	if($this->getRequest()->isPost()) {
		$updateData  = array();     
		$updateData['product_type_name']    = $params['productType']; 
		$this->dbAdapter->update('tbl_product_type', $updateData, array('md5(id) = ?'=>$params['product-type-id']));
		$this->_flashMessenger->addMessage(array("success"=>"Product type has been updated successfully."));
		$this->_redirect('/master/product-type/');
	}
}
public function deleteProductTypeAction(){
	try{
		$this->checklogin();
		$response = array();
		$requestParams = $this->getRequest()->getParams();
		if($requestParams['id']!=''){
			$data['is_active'] ='0';
			$where = array();
			$where['id=?'] = $requestParams['id'];
			$this->dbAdapter->update('tbl_product_type',$data,$where);
			$response['flag'] = true;
			$response['message'] = "Producy type has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Product type ID missing. Please try again.";
		}
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
} 
/*------------------------METHODS-END : PRODUCT TYPE----------------------------------*/

/*----------------------------------METHODS-START: PRODUCT UNIT-------------------------------- */ 
public function productUnitListAction()
{
	try{
		$this->checklogin();
		$params                 = $this->view->params = $this->getRequest()->getParams(); 
		$this->view->messages = $messages = $this->_flashMessenger->getMessages(); 
		$productUnitListQuery = $this->dbAdapter->select()->from('tbl_material_unit', array('*'))->where('is_active=1');
		$this->view->productUnitList = $productUnitListResult = $this->dbAdapter->fetchAll($productUnitListQuery); 
	} catch(Exception $e){
		echo $e->getMessage();
	} 
}
public function addProductUnitAction(){
	try {
		$this->checklogin(); 
		$this->view->messages  = $this->_flashMessenger->getMessages();
		$params = $this->getRequest()->getParams(); 
		if($this->getRequest()->isPost()) {
			$insertData= array();                                           
			$insertData['unit_name']    = $params['unit_name']; 
			$this->dbAdapter->insert('tbl_material_unit', $insertData);
			$this->_flashMessenger->addMessage(array("success"=>"Product unit has been saved successfully."));
			$this->_redirect('/master/product-unit-list');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function editProductUnitAction(){
	$this->checklogin(); 
	$this->view->messages  = $this->_flashMessenger->getMessages();
	$params = $this->getRequest()->getParams(); 
	$productUnitQuery = "SELECT * FROM tbl_material_unit WHERE md5(id) = '".$params['product-unit-id']."'";
	$this->view->productUnit =  $productUnitResult = $this->dbAdapter->fetchRow($productUnitQuery);
	if($this->getRequest()->isPost()) {
		$unitData  = array();     
		$unitData['unit_name']    = $params['unit_name']; 
		$this->dbAdapter->update('tbl_material_unit', $unitData, array('md5(id)=?'=>$params['product-unit-id']));
		$this->_flashMessenger->addMessage(array("success"=>"Product unit has been updated successfully."));
		$this->_redirect('/master/product-unit-list/');
	}
}
public function deleteProductUnitAction(){
	try{
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if($params['id']!=''){
			$data['is_active'] ='0';
			$where = array();
			$where['id=?'] = $params['id'];
			$this->dbAdapter->update('tbl_material_unit',$data,$where);
			$response['flag'] = true;
			$response['message'] = "Product Unit ".$params['name']." has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Unit ID missing. Please try again.";
		}
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
/*----------------------------------METHODS-END: PRODUCT UNIT-------------------------------- */ 

/*----------------------------------METHODS-START: PRODUCT BRAND -------------------------------- */ 
public function productBrandListAction()
{
	try {
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$productBrandListQuery = $this->dbAdapter->select()
		->from("tbl_material_brand", array("*"))
		->where("is_active = 1");
		$this->view->productBrand = $productBrandListResult = $this->dbAdapter->fetchAll($productBrandListQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function addProductBrandAction()
{
	try {
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			$insertData['brand_name'] = trim($params['brand_name']);
			$this->dbAdapter->insert("tbl_material_brand", $insertData);
			$this->_flashMessenger->addMessage(array("success"=>"Product brand name has been saved successfully."));
			$this->_redirect("/master/product-brand-list");
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function editProductBrandAction()
{
	try {
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$params = $this->getRequest()->getParams();
		$productBrandQuery = $this->dbAdapter->select()
		->from("tbl_material_brand", array("*"))
		->where("md5(id) = ?", $params['product-brand-id']);
		$this->view->productBrand = $productBrandResult = $this->dbAdapter->fetchRow($productBrandQuery);
		if ($this->getRequest()->isPost()) {
			$updateData['brand_name'] = trim($params['brand_name']);
			$this->dbAdapter->update("tbl_material_brand", $updateData, array("md5(id) = ?"=>$params['product-brand-id']));
			$this->_flashMessenger->addMessage(array("success"=>"Product brand name has been updated successfully."));
			$this->_redirect("/master/product-brand-list");
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function deleteProductBrandAction()
{
	try{
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if($params['id']!=''){
			$data['is_active'] ='0';
			$where = array();
			$where['id=?'] = $params['id'];
			$this->dbAdapter->update('tbl_material_brand',$data,$where);
			$response['flag'] = true;
			$response['message'] = "Brand name ".$params['name']." has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Brand ID missing. Please try again.";
		}
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
/*----------------------------------METHODS-END: PRODUCT BRAND -------------------------------- */ 

/*----------------------------METHODS-START : EXPENSE TRANSFER FOR--------------------------------*/
public function transferForAction(){
	try {
    // To check whether user is logged in or not (hitting the URL without login)
		$this->checklogin(); 
    // To show the flash message on view we user this helper
		$this->view->messages  = $this->_flashMessenger->getMessages();
    // To get expense transfer for list from master table
		$expenseTransferForListQuery = $this->dbAdapter->select()
		->from("tbl_expense_transfer_for_master as tetfm", array("id","expense_transfer_for","status"))
		->joinLeft("tbl_expense_type_master as tetm","tetm.id = tetfm.expense_type_id",array("tetm.expense_type"))
		->joinLeft("tbl_expense_in_type_master as teitm","teitm.id = tetfm.expense_in_id",array("teitm.expense_in_type"))
		->where("tetfm.status != 2");
		$this->view->expenseTransferForList = $expenseTransferForListResult = $this->dbAdapter->fetchAll($expenseTransferForListQuery);
    // To show expense type master list in add expense transfer for modal in view, this query is //being executed
		$expenseTypeListQuery = $this->dbAdapter->select()
		->from("tbl_expense_type_master", array("id","expense_type"))
		->where("status = 1");
		$this->view->expenseTypeList = $expenseTypeListResult = $this->dbAdapter->fetchAll($expenseTypeListQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function getExpenseInByExpenseTypeAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['expense_type_id'] == "") {
				$response['flag']    = false;
				$response['title']   = "Expense Type Missing!";
				$response['message'] = "Please try after refreshing the page.";
			} else {
				$getExpenseInDetailsQuery = $this->dbAdapter->select()
				->from("tbl_expense_in_type_master", array("id","expense_in_type"))
				->where("status = 1")
				->where("expense_type_id = ?",$params['expense_type_id']);
				$getExpenseInDetailsResult = $this->dbAdapter->fetchAll($getExpenseInDetailsQuery);
				$options = "<option value=''>Please Select</option>";
				foreach ($getExpenseInDetailsResult as $expenseIn) {
					$options .= '<option value="'.$expenseIn['id'].'">'.$expenseIn['expense_in_type'].'</option>';
				}
				$response['flag'] = true;
				$response['title'] = "Success";
				$response['option'] = $options;
			}
		} else {
			$response['flag']     = false;
			$response['title']    = "Invalid Request Type!";
			$response['message']  = "Request is not valid. Please try again later.";
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
public function addTransferForAction(){
	try {
		$this->checklogin(); 
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
      if ($params['expenseTypeId'] == "") {  // If Expense Type Id is missing
      	$response['flag'] = false;
      	$response['title'] = "Expense Type Missing!";
      	$response['message'] = "Please select expense type.";
     } else if ($params['expenseInId'] == "") {  // If Expense In Id is missing
     	$response['flag'] = false;
     	$response['title'] = "Expense In Missing!";
     	$response['message'] = "Please select expense in.";
     } else if ($params['expenseFor'] == "") {  // If Expense For is missing
     	$response['flag'] = false;
     	$response['title'] = "Expense For Missing!";
     	$response['message'] = "Please enter expense for.";
     } else {  // All data is set successfully
     	$insertData = array();
     	$insertData['expense_type_id']        = $params['expenseTypeId'];
     	$insertData['expense_in_id']          = $params['expenseInId'];
     	$insertData['expense_transfer_for']   = $params['expenseFor'];
     	$insertData['created_at']             = date('Y-m-d H:i:s');
     	$insertData['created_by']             = $this->id;
      // To insert data into table
     	$this->dbAdapter->insert("tbl_expense_transfer_for_master", $insertData);
      // Return Response
     	$response['flag'] = true;
     	$response['title'] = "Saved Successfully";
     	$response['message'] = "Expense Transfer For saved successfully.";
     }
  } else {  // If Request is not a post type then response is returned
  	$response['flag'] = false;
  	$response['title'] = "Invalid Request!";
  	$response['message'] = "Request is not valid. Please try again later."; 
  }
} catch(Exception $e){
	$response['flag'] = false;
	$response['title'] = "Some Internal Error!";
	$response['message'] = $e->getMessage();
}
echo json_encode($response);
exit;
}
public function getExpenseTransferForAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
    if ($params['expense_transfer_for_id'] != "") { // If there is data in param
    	$expenseTransferForDetailsQuery = $this->dbAdapter->select()
    	->from("tbl_expense_transfer_for_master",array("id","expense_transfer_for","expense_type_id","expense_in_id"))
    	->where("id = ?", $params['expense_transfer_for_id']);
    	$this->view->expenseTransferForDetails = $expenseTrasferForDetailsResult = $this->dbAdapter->fetchRow($expenseTransferForDetailsQuery);
// To get expense type master list
    	$expenseTypeListQuery = $this->dbAdapter->select()
    	->from("tbl_expense_type_master", array("id","expense_type"))
    	->where("status = 1");
    	$this->view->expenseTypeList = $expenseTypeListResult = $this->dbAdapter->fetchAll($expenseTypeListQuery);
// To get expense in master list
    	$expenseInTypeDetailsQuery = $this->dbAdapter->select()
    	->from("tbl_expense_in_type_master", array("id","expense_in_type"))
    	->where("expense_type_id = ?", $expenseTrasferForDetailsResult['expense_type_id'])
    	->where("status = 1");
    	$this->view->expenseInTypeDetails = $expenseInTypeDetailsResult = $this->dbAdapter->fetchAll($expenseInTypeDetailsQuery);
    	$this->_helper->layout()->disableLayout();
    }
} catch(Exception $e){

}
}

public function editExpenseTransferForAction(){
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		$updateData = array();
		if ($this->getRequest()->isPost()) {
			if ($params['expenseTypeId'] == "") {
				$response['flag'] = false;
				$response['message'] = "Expense Type Missing! Please enter expense type.";
			} else if ($params['expenseInId'] == "") {
				$response['flag'] = false;
				$response['message'] = "Expense In Type Missing! Please enter expense in type.";
			} else if ($params['expenseTransferFor'] == "") {
				$response['flag'] = false;
				$response['message'] = "Expense Transfer For Missing! Please enter expense transfer for.";
			} else { 
				$updateData['expense_type_id']        = $params['expenseTypeId'];
				$updateData['expense_in_id']          = $params['expenseInId'];
				$updateData['expense_transfer_for']   = $params['expenseTransferFor'];
				//$updateData['updated_at']             = date('Y-m-d H:i:s');
			///	$updateData['updated_by']             = $this->id;
				$this->dbAdapter->update("tbl_expense_transfer_for_master", $updateData, array("id = ?"=>$params['expenseForId']));
				$response['flag'] = true;
				$response['message'] = "Expense Transfer For has been updated successfully.";
			}
		} else {
			$response['flag'] = false;
			$response['message'] = "Invalid Request Type. Please try again.";
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
public function deactivateActivateDeleteExpenseTransferForAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		$updateData = array();
		$updateData['updated_at'] = date('Y-m-d H:i:s');
		$updateData['updated_by'] = $this->id;
		$where['id = ?'] = $params['expense_transfer_for_id'];
		if ($this->getRequest()->isPost()) {
			if ($params['type'] == "deactivate") {
				$updateData['status'] = "0";
				$this->dbAdapter->update("tbl_expense_transfer_for_master", $updateData, $where);
				$response['flag']     = true;
				$response['title']    = "Deactivated Successfully";
				$response['message']  = "Expense Transfer For has been deactivated successfully."; 
			} else if ($params['type'] == "activate") {
				$updateData['status'] = "1";
				$this->dbAdapter->update("tbl_expense_transfer_for_master", $updateData, $where);
				$response['flag']     = true;
				$response['title']    = "Activated Successfully";
				$response['message']  = "Expense Transfer For has been activated successfully."; 
			} else if ($params['type'] == "delete") {
				$updateData['status'] = "2";
				$this->dbAdapter->update("tbl_expense_transfer_for_master", $updateData, $where);
				$response['flag']     = true;
				$response['title']    = "Deleted Successfully";
				$response['message']  = "Expense Transfer For has been deleted successfully."; 
			} else {
				$response['flag']     = false;
				$response['title']    = "Request Type Missing!";
				$response['message']  = "Request type not found. Please try after refreshing the page.";
			}
		} else {
			$response['flag']     = false;
			$response['title']    = "Invalid Request Type!";
			$response['message']  = "Please try after refreshing the page.";
		}
	} catch(Exception $e){
		$response['flag']     = false;
		$response['title']    = "Error";
		$response['message']  = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
/*----------------------------METHODS-END : TRANSFER FOR--------------------------------*/

/*----------------------------METHODS-START : STATE FOR--------------------------------*/
public function stateForAction(){
	try {
		$this->checklogin(); 
		$params                 = $this->view->params = $this->getRequest()->getParams(); 
		$this->view->messages  = $this->_flashMessenger->getMessages();  
		$stateQuery = "SELECT * FROM tbl_state_for WHERE status = '1' ";
		$this->view->stateFor = $stateResult = $this->dbAdapter->fetchAll($stateQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function addStateForAction(){
	try{
		$this->checklogin(); 
		$this->view->messages  = $this->_flashMessenger->getMessages();
		$this->view->params = $params = $this->getRequest()->getParams(); 
		if($this->getRequest()->isPost()) {
			$taskData  = array();                                           
			$taskData['state_for']    = trim($params['stateFor']); 
			$taskData['created']      = date('Y-m-d H:i:s');                                  
			$this->dbAdapter->insert('tbl_state_for', $taskData);
			$this->_flashMessenger->addMessage(array("success"=>"Data has been saved successfully."));
			$this->_redirect('/master/state-for/');
		}
	} catch(Exception $e){
		echo $e->getMessage();exit;
	}
}
public function addLocationAction(){
	try{
		$this->checklogin(); 
		$this->view->messages  = $this->_flashMessenger->getMessages();
		$this->view->params = $params = $this->getRequest()->getParams(); 
		
		if($this->getRequest()->isPost()) {
			$taskData  = array();                                           
			$taskData['site_id']    =$params['site_id']; 
			$taskData['site_name']      = $params['site_Name']; 
			$taskData['lat']    =$params['latitude']; 
			$taskData['lng']      = $params['longitude']; 

			$this->dbAdapter->insert('tbl_site_map', $taskData);
			$this->_flashMessenger->addMessage(array("success"=>"Data has been saved successfully."));
			$this->_redirect('/master/add-location/');
		}
	} catch(Exception $e){
		echo $e->getMessage();exit;
	}
}
public function deleteStateForAction(){
	try {
		$response = array();
		$this->checklogin();
		$requestParams = $this->getRequest()->getParams();
		if($requestParams['stateForId'] != ''){
			$Data['status']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['stateForId']);
			$this->dbAdapter->update('tbl_state_for', $Data, $where);
			$response['flag'] = true;
			$response['message'] = "Data Deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "ID is missing. Please try again later.";
		}
		$this->_helper->viewRenderer->setNoRender(true);
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
} 
public function editStateForAction(){
	try {
		$this->checklogin(); 
		$this->view->messages  = $this->_flashMessenger->getMessages();
		$params = $this->getRequest()->getParams(); 
		$sql_state = "SELECT * FROM tbl_state_for WHERE md5(id) = '".$params['state-for-id']."' ";
		$qry_state = $this->dbAdapter->fetchRow($sql_state);
		$this->view->stateFor = $qry_state;
		if($this->getRequest()->isPost()) {
			$roleData  = array();         
			$roleData['state_for'] = trim($params['stateFor']);                                   
			$this->dbAdapter->update('tbl_state_for', $roleData,array('md5(id)=?'=>$params['state-for-id']));
			$this->_flashMessenger->addMessage(array("success"=>"Data has been updated successfully."));
			$this->_redirect('/master/state-for/');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
/*----------------------------METHODS-END : STATE FOR--------------------------------*/

public function checklogin(){   
	$auth           = Zend_Auth::getInstance(); 
	$errorMessage   = ""; 
	/*************** check user identity ************/
	if(!$auth->hasIdentity()){
		$this->_redirect('/admin/index');  
	}   
}

public function debitAccountsAction(){
	$this->checklogin(); 
	$this->view->params = $params = $this->getRequest()->getParams();
	$this->view->messages   = $this->_flashMessenger->getMessages();
	$query ="Select * from tbl_debit_account where is_active = 1";
	$this->view->debit_data = $debitData = $this->dbAdapter->fetchAll($query);
}

public function addDebitAccountAction(){
	try{
		$this->checklogin();
		$this->view->params = $params = $this->getRequest()->getParams();
		$db = $this->db = Zend_Db_Table::getDefaultAdapter();
		// echo "<pre>";print_r($params);exit;
		if($params['id']){
			$this->view->params = $params = $this->getRequest()->getParams();
			$query = "Select * from tbl_debit_account where id =".$params['id'];
			$result = $db->fetchRow($query);
			$this->view->companies = $result;
			if($this->getRequest()->isPost()){
				$companyData=array();
				$companyData['debit_account']=$params['debit_account'];
				// echo "<pre>";print_r($companyData);exit;
				$this->dbAdapter->update('tbl_debit_account',$companyData,array('id=?'=>$params['id']));

				$this->_redirect('/master/debit-accounts'); 

			}
		}else{
			if($this->getRequest()->isPost()){
				$companyData=array();
				$companyData['debit_account']=$params['debit_account'];
					// echo "<pre>";print_r($companyData);exit;
				$this->dbAdapter->insert('tbl_debit_account',$companyData);
				$this->_redirect('/master/debit-accounts'); 

			}
		}
		$layout = $this->_helper->layout();
		$layout->disableLayout('');
	} 
	catch(Exception $e){
		echo $e->getMessage();exit;
	}
// echo '<pre>';print_r($holidays);exit;
}

public function deleteDebitAccountAction(){
	try {
		$response = array();
		$this->checklogin();
		$requestParams = $this->getRequest()->getParams();
		if($requestParams['id']!=''){
			$Data['is_active']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['id']);
			$this->dbAdapter->update('tbl_debit_account', $Data, $where);
			$response['flag'] = true;
			$response['message'] = "Debit Account has been deleted successfully.";
		} else {
			$response['flag'] = false;
			$response['message'] = "Debit Account ID is missing. Please try again.";
		}
		$this->_helper->viewRenderer->setNoRender(true);
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
// echo '<pre>';print_r($holidays);exit;
}

public function siteDocumentAction()
{
	try {
		$this->checklogin();   
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$siteDocumentMasterListQuery = $this->dbAdapter->select()
		->from("tbl_site_document", array("id","document_name"))
		->where("status = 1");
		$this->view->siteDocumentMasterList = $siteDocumentMasterListtResult = $this->dbAdapter->fetchAll($siteDocumentMasterListQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function addSiteDocumentAction(){
	try {
		$this->checklogin(); 
		$is_required = array();
		$params = $this->getRequest()->getParams();
		// echo '<pre>';print_r($params);exit;

		if($this->getRequest()->isPost()) {
			$insertData  = array(); 
			$insertData['id'] = $params['id'];                                        
			$insertData['document_name'] = trim(ucwords(strtolower($params['document_name'])));
			$insertData['is_required'] = isset($params['is_required']) && $params['is_required'] == "on" ? 1: 0;

// $insertData['created_at'] = date('Y-m-d H:i:s');                                   
			$this->dbAdapter->insert('tbl_site_document', $insertData);
			$this->_flashMessenger->addMessage(array("success"=>"Site Document has been saved successfully."));
			$this->_redirect('/master/site-document');
		}
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}




public function getSiteDocumentAction()
{
	try {
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$sitedocumentQuery = $this->dbAdapter->select()
		->from("tbl_site_document", array("id","document_name"))
		->where("id = ?", $params['site_id']);
		$this->view->siteDocumentDetails = $siteDocumentResult = $this->dbAdapter->fetchRow($sitedocumentQuery);
		$this->_helper->layout()->disableLayout();
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}


public function deleteSiteDocumentAction(){
	try {
		$response = array();
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();

		$requestParams = $this->getRequest()->getParams();
		if($requestParams['id']!=''){
			$Data['status']    = '0';
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['id']);
			$this->dbAdapter->update('tbl_site_document', $Data, $where);
            $response['flag'] = true;
		    $response['message'] = "Deleted Successfully";
		}
		$this->_helper->viewRenderer->setNoRender(true);
		$this->_helper->layout()->disableLayout(); 
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
}
