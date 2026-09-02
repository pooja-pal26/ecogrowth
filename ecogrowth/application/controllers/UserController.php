<?php
/**
* Logimetrix Techsolution Pvt. Ltd.
* File Name   : UserController.php
* File Description  : User Controller
* Created By : Ajay Kumar
* Created Date: 01 June 2017
*/
class UserController extends Zend_Controller_Action
{
	var $dbAdapter;
	public function init()
	{
		/* Initialize action controller here */
		$this->initView();
		$this->_flashMessenger  = $this->_helper->getHelper('FlashMessenger');
		$bootstrap              = $this->getInvokeArg('bootstrap');
		$aConfig                = $bootstrap->getOptions();
		$this->view->siteurl    = $aConfig['site']['image']['url'];
		$this->dbAdapter        = Zend_Db_Table::getDefaultAdapter(); 
		$auth                   = Zend_Auth::getInstance();
		$authStorage           = $auth->getStorage();
		$this->id              = $authStorage->read()->id;
		$this->role            = $authStorage->read()->role;
	}
	public function indexAction(){
		$this->checklogin(); 
		
		$this->view->messages  = $this->_flashMessenger->getMessages();    
		$users                 = new Application_Model_User();
		$this->view->user_list = $user_list  = $users->getUserList();
	}

	public function userListAction(){
		$this->checklogin(); 
		$auth                  = Zend_Auth::getInstance();
		$authStorage           = $auth->getStorage();
		$this->WebLoginID      = $authStorage->read()->WebLoginID;
		$this->id              = $authStorage->read()->id;
		$this->Role            = $authStorage->read()->Role; 
		$params                = $this->view->params = $this->getRequest()->getParams(); 
		$this->view->totalnum   = $params['page'];
		$roles                 = new Application_Model_User();
		$this->view->user_list = $user_list  = $roles->getUserList();
		$this->view->messages  = $this->_flashMessenger->getMessages();  
		$page=$this->_getParam('page',1);
		$paginator = Zend_Paginator::factory($user_list);      
$paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
$paginator->setItemCountPerPage(10); // number of items to show per page
$this->view->paginator = $paginator;
$this->view->totalrec = $paginator->getTotalItemCount();  
$this->_helper->layout()->disableLayout();  
}
function getUserCount($user_id){
///query for get user count 
	$sql_user = "select count(id) as totalCount from cairn_user_role_mapping where user_id ='".$user_id."'";
	$userCount = $this->dbAdapter->fetchRow($sql_user);
	return $userCount['totalCount']; 
}
public function getAllRoleAction(){
//echo "sdrfasf";exit;
	$role_type =  $this->_getParam('role_type_id'); 
	$user = new Application_Model_User();
	$roledata = $user->getRoleByRoleType($role_type);
//print_r($roledata);exit;
	$role_List[] = array("value"=>"",'text'=>"---Select Role---");
	foreach($roledata as $key){
		$role_List[] = array("value"=>$key['id'],"text"=>$key['role']);
	}
//print_r($Crop_List);exit;
	$this->getHelper('Layout')->disableLayout();
	$this->getHelper('ViewRenderer')->setNoRender();
	$this->getResponse()->setHeader('Content-Type', 'application/json');
	echo json_encode(array('options'=>$role_List));
	return; 
}
function createUserAction(){
	try{
		$this->checklogin(); 
		
		$user = new Application_Model_User(); 
		$this->view->params = $params = $this->getRequest()->getParams(); 
		$this->view->messages  = $this->_flashMessenger->getMessages();
		$this->view->getalldepartment = $result = $user->getDepartment();
		$this->view->getRoletype = $getRoletype = $user->getRoletype();
		if($this->getRequest()->isPost()) {        
			$user_mobile  = $user->getusermobile($params['mobile_number']);
			$user_email  = $user->getuseremail($params['email_id']);
			if ($user_mobile) {
				$this->_flashMessenger->addMessage(array("error"=>"Entered Mobile number already exists in the system."));
				$this->_redirect("/user/create-user");
			} else if ($user_email) {
				$this->_flashMessenger->addMessage(array("error"=>"Entered Email already exists in the system."));
				$this->_redirect("/user/create-user");
			}
			$inputData['first_name'] 		= trim(strtoupper($params['first_name']));
			$inputData['name'] 				= trim(strtoupper($params['first_name']));
			if ($params['last_name']) {
				$inputData['last_name']		= trim(strtoupper($params['last_name']));
				$inputData['name'] 			= $inputData['first_name']." ".$inputData['last_name'];
			}
			$inputData['contact_no'] 		= trim($params['mobile_number']);
			if ($params['alternate_mobile']) {
				$inputData['alternate_mobile'] = trim($params['alternate_mobile']);
			}
			$inputData['email_id']  		= trim($params['email_id']);
			$inputData['department']		= $params['department'];
			$inputData['role_type']			= $params['role_type'];
			$inputData['role']				= $params['role'];
			$inputData['date_of_joining'] 	= $this->dateConverter($params['doj']);
			if ($_FILES['profile_pic']['name']) {
				$target_dir = "uploads/user/profile_image/";
				$target_file = $target_dir.basename($_FILES['profile_pic']['name']);
				$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
				
				if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
					&& $imageFileType != "gif" ) {
					$this->_flashMessenger->addMessage(array("error"=>"Image type not supported. Please upload JPG, JPEG, PNG or GIF Images only."));
				$this->_redirect("/user/create-user");
			} else {
				move_uploaded_file($_FILES["profile_pic"]["tmp_name"], $target_file);
				$inputData['profile_path'] = "/".$target_file;
			}
		}
		if ($params['p_address']) {
			$inputData['permanent_address'] 	= trim(strtoupper($params['p_address']));
		}
		if ($params['c_address']) {
			$inputData['current_address'] 		= trim(strtoupper($params['c_address']));
		}
		$inputData['password'] 					= trim(md5($params['password']));
		$inputData['finger_iso_1']         		= $params['finger_iso_1'];
		$inputData['finger_iso_2']         		= $params['finger_iso_2'];
		$inputData['finger_iso_3']         		= $params['finger_iso_3'];
		$inputData['finger_iso_4']         		= $params['finger_iso_4'];
		$inputData['finger_iso_5']         		= $params['finger_iso_5'];
		$inputData['created_on'] 				= date("Y-m-d H:i:s");
		$inputData['created_by'] 				= $this->id;
		$this->dbAdapter->insert("tbl_user", $inputData);
		$this->_flashMessenger->addMessage(array("success"=>"User has been created successfully"));
		$this->_redirect("/user");
	}
} catch(Exception $e){
	echo $e->getMessage();
	exit;
}
}
public function paginationAction(){
	$this->checklogin(); 
	$auth                  = Zend_Auth::getInstance();
	$authStorage           = $auth->getStorage();
	$this->WebLoginID      = $authStorage->read()->WebLoginID;
	$this->id              = $authStorage->read()->id;
	$this->Role            = $authStorage->read()->Role; 
	$params                = $this->view->params = $this->getRequest()->getParams(); 
	$this->view->totalnum  = $params['page'];
	$this->view->messages  = $this->_flashMessenger->getMessages();  
///query for get user role mapping records 
	$query = $this->dbAdapter->select()->from(array('cairn_user_role_mapping'),array('*'))->order('id desc');
	$role_list  = $this->dbAdapter->fetchAll($query); 
	$this->view->user_role_list = $user_role_list = array();
	foreach ($role_list as $value) {
///query for get department 
		$sql_department = "select department from cairn_department where id in(".$value['department'].")";
		$department = $this->dbAdapter->fetchAll($sql_department); 
///query for get location 
		$sql_location = "select location from cairn_location where id in(".$value['location'].")";
		$location = $this->dbAdapter->fetchAll($sql_location); 
///query for get task 
		$sql_category = "select task as category from cairn_task_type where id in(".$value['category'].")";
		$category = $this->dbAdapter->fetchAll($sql_category);
///query for get user name 
		$sql_user = "select name from tbl_user where id = '".$value['user_id']."'";
		$user = $this->dbAdapter->fetchRow($sql_user); 
		$role = array('id'=>$value['id'], 'department'=>$department, 'sbu'=>$value['sbu'], 'location'=>$location, 'category'=>$category, 'user'=>$user['name'], 'access'=>$value['access']);
		array_push($user_role_list, $role);
	}
	$page=$this->_getParam('page',1);
	$paginator = Zend_Paginator::factory($user_role_list);      
$paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
$paginator->setItemCountPerPage(10); // number of items to show per page
$this->view->paginator = $paginator;
$this->view->totalrec = $paginator->getTotalItemCount(); 
$this->_helper->layout()->disableLayout();  
}
public function editUserInfoAction(){   
	try{
		$this->checklogin(); 
		$user = new Application_Model_User(); 
		$this->view->messages  = $this->_flashMessenger->getMessages();
		$params = $this->getRequest()->getParams(); 
		$this->view->user_info = $user_info = $user->getUserInfoByUserId($params["id"]);
		$this->view->getalldepartment = $result = $user->getDepartment();
		$this->view->getRoletype = $getRoletype = $user->getRoletype();
		$user_role_query = $this->dbAdapter->select()
		->from('tbl_roles', array("role", "id"))
		->where("role_type = ?", $user_info['role_type']);
		$this->view->user_role = $user_role = $this->dbAdapter->fetchAll($user_role_query);
		if($this->getRequest()->isPost()) {
			if ($params['mobile_number'] != $user_info['contact_no']) {
				$user_mobile  = $user->getusermobile($params['mobile_number']);
				if ($user_mobile) {
					$this->_flashMessenger->addMessage(array("error"=>"Entered Mobile number already exists in the system."));
					$this->_redirect("/user/edit-user-info/id/".$params['id']);
				}
			} else if ($params['email_id'] != $user_info['email_id']) {
				$user_email  = $user->getuseremail($params['email_id']);
				if ($user_email) {
					$this->_flashMessenger->addMessage(array("error"=>"Entered Email already exists in the system."));
					$this->_redirect("/user/edit-user-info/id/".$params['id']);
				}
			}
			$inputData['name'] 					= trim(strtoupper($params['first_name']));
			$inputData['first_name'] 			= trim(strtoupper($params['first_name']));
			if ($params['last_name']) {
				$inputData['last_name'] 		= trim(strtoupper($params['last_name']));
				$inputData['name']				= $inputData['first_name']." ".$inputData['last_name'];
			}
			$inputData['contact_no']			= trim($params['mobile_number']);
			if ($params['alternate_mobile']) {
				$inputData['alternate_mobile'] 		= trim($params['alternate_mobile']);
			}
			$inputData['email_id']				= trim($params['email_id']);
			$inputData['department']			= trim($params['department']);
			$inputData['role_type']				= trim($params['role_type']);
			$inputData['role']					= trim($params['role']);
			$inputData['date_of_joining']		= date("Y-m-d", strtotime($params['doj']));
			if ($params['p_address']) {
				$inputData['permanent_address']	= trim(strtoupper($params['p_address']));
			}
			if ($params['c_address']) {
				$inputData['current_address']	= trim(strtoupper($params['c_address']));
			}
			if ($_FILES['profile_pic']['name']) {
				$target_dir = "uploads/user/profile_image/";
				$target_file = $target_dir.basename($_FILES['profile_pic']['name']);
				$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
				if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
					&& $imageFileType != "gif" ) {
					$this->_flashMessenger->addMessage(array("error"=>"Image type not supported. Please upload JPG, JPEG, PNG or GIF Images only."));
				$this->_redirect("/user/edit-user-info/id/".md5($user_info['id']));
			} else {
				move_uploaded_file($_FILES["profile_pic"]["tmp_name"], $target_file);
				$inputData['profile_path'] = "/".$target_file;
			}
		}
		$inputData['password'] 					= trim(sha1(md5($params['password'])));
		$inputData['plain_password'] 			= $params['password'];
		$inputData['finger_iso_1']         		= $params['finger_iso_1'];
		$inputData['finger_iso_2']         		= $params['finger_iso_2'];
		$inputData['finger_iso_3']         		= $params['finger_iso_3'];
		$inputData['finger_iso_4']         		= $params['finger_iso_4'];
		$inputData['finger_iso_5']         		= $params['finger_iso_5'];
		$inputData['updated'] 					= date("Y-m-d H:i:s");
		$inputData['created_by'] 				= $this->id;
		$this->dbAdapter->update("tbl_user", $inputData, array("id = ?"=>$user_info['id']));
		$this->_flashMessenger->addMessage(array("success"=>"User details have been updated successfully"));
		$this->_redirect("/user");
	}
} catch(Exception $e){
	echo $e->getMessage();exit;
}
}
public function getSupervisorListAction()
{
	try {
		$this->checklogin();
		$response = array();
		$getSupervisorListQuery = $this->dbAdapter->select()
		->from("tbl_user", array("id","name"))
		->where("status = 1")
		->where("role_type = 3")
		->where("role = 15")
		->order('name ASC');
		$getSupervisorListResult = $this->dbAdapter->fetchAll($getSupervisorListQuery);
		if ($getSupervisorListResult) {
			$options = '<option value="">Please Select</option>';
			foreach ($getSupervisorListResult as $supervisors) {
				$options .= '<option value="'.$supervisors['id'].'">'.ucwords(strtolower($supervisors['name'])).'</option>';
			}
			$response['flag'] = true;
			$response['supervisor_list'] = $options;
		} else {
			$response['flag'] = false;
			$response['title'] = "Data Not Found!";
			$response['message'] = "Supervisors list not found. Please add supervisors.";
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['title'] = "Internal Server Error!";
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
public function viewUserProfileAction()
{
	try{
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$userDetailsQuery = $this->dbAdapter->select()
		->from("tbl_user as u", array("*"))
		->joinLeft("cairn_department as cd","cd.id = u.department", array("cd.department"))
		->joinLeft("tbl_role_type as rt","rt.id = u.role_type", array("rt.role_type"))
		->joinLeft("tbl_roles as tr","tr.id = u.role", array("tr.role"))
		->where("u.status = 1")
		->where("u.is_deleted = 0")
		->where("md5(u.id) = ?", $params['user_id']);
		$this->view->userDetails = $userDetailsResult = $this->dbAdapter->fetchRow($userDetailsQuery);
		$this->_helper->layout()->disableLayout();
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function deactiveUsersAction()
{
	try{
		$this->checklogin();
		$deactiveUsersListQuery = $this->dbAdapter->select()
		->from("tbl_user as u", array("id","name","contact_no","updated","email_id","date_of_joining"))
		->joinLeft("cairn_department as cd","cd.id = u.department",array("cd.department"))
		->where("u.status = 0")
		->where("u.is_deleted = 0");
		$this->view->deactiveUsers = $deactiveUsersListResult = $this->dbAdapter->fetchAll($deactiveUsersListQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function deactivateUserProfileAction(){
	try{
		$this->checklogin();
		$response = array();
		$requestParams = $this->getRequest()->getParams();
		if($requestParams['user_id'] != ''){
			$Data['status']    	= '0';
			$Data['updated']	= date("Y-m-d");
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('md5(id) = ?', $requestParams['user_id']);
			$updateStatus = $this->dbAdapter->update('tbl_user', $Data, $where);
			if ($updateStatus) {
				$response['flag'] = true;
				$response['message'] = $requestParams['name']." has been deactivated successfully.";
			} else {
				$response['flag'] = false;
				$response['message'] = "Something went wrong. Please try againg.";
			}
		} else {
			$response['flag'] = false;
			$response['message'] = "User ID is missing. Please try again";	
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	$this->_helper->layout()->disableLayout(); 
	echo json_encode($response);
	exit;
}
public function activateUserProfileAction(){
	try{
		$this->checklogin();
		$response = array();
		$requestParams = $this->getRequest()->getParams();
		if($requestParams['user_id'] != ''){
			$Data['status']    = '1';
			$Data['updated']	= date("Y-m-d");
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('md5(id) = ?', $requestParams['user_id']);
			$updateStatus = $this->dbAdapter->update('tbl_user', $Data, $where);
			if ($updateStatus) {
				$response['flag'] = true;
				$response['message'] = $requestParams['name']." has been activated successfully.";
			} else {
				$response['flag'] = false;
				$response['message'] = "Something went wrong. Please try againg.";
			}
		} else {
			$response['flag'] = false;
			$response['message'] = "User ID is missing. Please try again";	
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	$this->_helper->layout()->disableLayout(); 
	echo json_encode($response);
	exit;
}
public function clearUserDeviceIdAction()
{
	try{
		$this->checklogin();
		$response = array();
		$requestParams = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if($requestParams['user_id'] != ''){
				$Data['device_id']  	= '';
				$Data['firebase_token'] = '';
				$Data['access_token']  	= '';
				$Data['updated']		= date("Y-m-d");
				$where = array();
				$where[] = $this->dbAdapter->quoteInto('md5(id) = ?', $requestParams['user_id']);
				$updateStatus = $this->dbAdapter->update('tbl_user', $Data, $where);
				if ($updateStatus) {
					$response['flag'] = true;
					$response['title'] = "Cleared Successfully";
					$response['message'] = $requestParams['name']."'s device ID has been cleared successfully.";
				} else {
					$response['flag'] = false;
					$response['title'] = "Clearing Device ID Failed!";
					$response['message'] = "Please try again after refreshing the page.";
				}
			} else {
				$response['flag'] = false;
				$response['title'] = "User ID Missing!";
				$response['message'] = "Please try again after refreshing the page.";
			}
		} else {
			$response['flag'] = false;
			$response['title'] = "Invalid Request Type!";
			$response['message'] = "Please try again after refreshing the page.";
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	echo json_encode($response);
	exit;
}
public function deleteUserProfileAction(){
	try{
		$this->checklogin();
		$response = array();
		$requestParams = $this->getRequest()->getParams();
		if($requestParams['user_id'] != ''){
			$Data['status']    	= '0';
			$Data['is_deleted'] = '1';
			$Data['updated']	= date("Y-m-d");
			$where = array();
			$where[] = $this->dbAdapter->quoteInto('md5(id) = ?', $requestParams['user_id']);
			$updateStatus = $this->dbAdapter->update('tbl_user', $Data, $where);
			if ($updateStatus) {
				$response['flag'] = true;
				$response['message'] = $requestParams['name']." has been deleted permanent successfully.";
			} else {
				$response['flag'] = false;
				$response['message'] = "Something went wrong. Please try againg.";
			}
		} else {
			$response['flag'] = false;
			$response['message'] = "User ID is missing. Please try again";	
		}
	} catch(Exception $e){
		$response['flag'] = false;
		$response['message'] = $e->getMessage();
	}
	$this->_helper->layout()->disableLayout(); 
	echo json_encode($response);
	exit;
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
		$this->_redirect('/index');  
	}   
} 
}
