<?php

/***************************************************************

 * Logimetrix Techsolution Pvt. Ltd.

 * File Name   : ApiController.php

 * File Description  : All Api Method

 * Created By : kriti singh 

 * Created Date: 17 july 2017

 ***************************************************************/



class ApiController extends Zend_Controller_Action{

	var $phpNative;
	var $db;
	var $currdate;
	var $siteurl;
	var $dbAdapter;

	public function init(){
		//Initialize action controller here 
		$this->_helper->viewRenderer->setNoRender(true);
		$bootstrap 				= $this->getInvokeArg('bootstrap');
		$aConfig 				= $bootstrap->getOptions();
		$this->secretkey 		= $aConfig['api']['searchuser']['secret'];
		$this->siteurl 			= $aConfig['api']['site']['url'];
		$this->email 			= $aConfig['api']['email']['url'];
		$this->view->duration   = $aConfig['pending']['days']['duration'];
		$this->db 				= Zend_Db_Table::getDefaultAdapter();
		$this->day 				= date("d");
		$this->month 			= date("m");
		$this->year 			= date("Y");
		$this->currdate 		= date("Y-m-d H:i:s");
	}


	public function saveNewExpenseAction(){
		$db = $this->db;
		// $params = json_decode(file_get_contents('php://input'), true);
		$params   = $this->getRequest()->getParams();
		$accessToken	= isset($params['local_token'])?$params['local_token']:"";
		$po_no	 	    = isset($params['po_no'])?$params['po_no']:"";
		$site_id	    = isset($params['site_id'])?$params['site_id']:"";
		$amount     	= isset($params['amount'])?$params['amount']:"";
		$transfer_for	= isset($params['transfer_for'])?$params['transfer_for']:"";
		$transfered_to  = isset($params['transfered_to'])?$params['transfered_to']:"";
		$transfer_date	= isset($params['transfer_date'])?$params['transfer_date']:"";
		$remark      	= isset($params['remark'])?$params['remark']:"";
		$form_type	        = isset($params['form_type'])?$params['form_type']:"";
		$state_for_two	    = isset($params['state_for_two'])?$params['state_for_two']:"";
		$amount_two     	= isset($params['amount_two'])?$params['amount_two']:"";
		$transfer_for_two	= isset($params['transfer_for_two'])?$params['transfer_for_two']:"";
		$transfered_to_two  = isset($params['transfered_to_two'])?$params['transfered_to_two']:"";
		$transfer_date_two	= isset($params['transfer_date_two'])?$params['transfer_date_two']:"";
		$remark_two     	= isset($params['remark_two'])?$params['remark_two']:"";
		$succes         = FALSE;
		$error_code  = 1;
		// echo '<pre>';
		// print_r($params);exit;
		try{
			$db->beginTransaction();
			if($form_type == ''){
				$error_code  = 407;
				throw new Exception("form type not found");
			}		
			if(!$accessToken){
				$error_code  = 407;
				throw new Exception("Required parameter missing.");
			}
			$api = new Application_Model_Api();
			$allUserData = $api->getUserDetailByAccessToken($accessToken);
			if($allUserData['access_token'] != $accessToken){
				$error_code = 407;
				throw new Exception('You are not authorized for this device.');
			}

			if($allUserData['status'] != 1){
				$error_code = 407;
				throw new Exception('This account deactivated by admin.');
			}
			$transferdate = $this->dateConverter($transfer_date);
			$check_sql = "SELECT count(id) as count FROM tbl_expense WHERE po_no = '".$po_no."' AND 
			site_id = '".$site_id."' AND transfer_date = '".$transferdate."' AND 
			transfered_to = '".$transfered_to."' AND amount = '".$amount."' ";
			$check_qry = $this->db->fetchRow($check_sql);

			if($check_qry['count'] > 0){
				$error_code  = 405;
				throw new Exception("Data Already Exist.");
			}

			$sql_statefor = "SELECT operating_unit as operating_unit FROM tbl_expense_report WHERE po_no = '".$po_no."' ";
			$qry_statefor = $this->db->fetchRow($sql_statefor);


			
			if($form_type=='0'){
				$dataArray = array();
				$dataArray['po_no']          = $po_no;
				$dataArray['site_id']        = $site_id;
				$dataArray['transfer_for']   = $transfer_for;
				$dataArray['state_for']      = $qry_statefor['operating_unit'];
				$dataArray['amount']         = $amount;
				$dataArray['transfer_date']  = $this->dateConverter($transfer_date);
				$dataArray['transfered_to']  = $transfered_to;
				$dataArray['created']        = date('Y-m-d H:i:s');
				$dataArray['remark']         = $remark;

				if( isset( $_FILES['attachment']['error'] ) ){
					if( $_FILES['attachment']['error'] == '0' ){
						move_uploaded_file($_FILES['attachment']['tmp_name'],"uploads/expense/".$_FILES['attachment']['name']);
						$dataArray['attachment'] = "/uploads/expense/".$_FILES['attachment']['name'];
					}else {
						$dataArray['attachment'] = "";  
					}
				}


				// echo '<pre>';
				// print_r($dataArray);exit;
				$this->db->insert('tbl_expense', $dataArray);
			}

			if($form_type=='1'){
				$dataArr = array();
				$dataArr['transfer_for']   = $transfer_for_two;
				$dataArr['state_for']      = $state_for_two;
				$dataArr['amount']         = $amount_two;
				$dataArr['transfer_date']  = $this->dateConverter($transfer_date_two);
				$dataArr['transfered_to']  = $transfered_to_two;
				$dataArr['created']        = date('Y-m-d H:i:s');
				$dataArr['remark']         = $remark_two;

				if( isset( $_FILES['attachment']['error'] ) ){
					if( $_FILES['attachment']['error'] == '0' ){
						move_uploaded_file($_FILES['attachment']['tmp_name'],"uploads/expense/".$_FILES['attachment']['name']);
						$dataArr['attachment'] = "/uploads/expense/".$_FILES['attachment']['name'];
					}else {
						$dataArr['attachment'] = "";  
					}
				}

				// echo '<pre>';
				// print_r($dataArr);exit;

				$this->db->insert('tbl_expense_office', $dataArr);
			}

			$db->commit();

			$succes = TRUE;	

		}catch(Exception $e){
			$error= $e->getMessage();
		}

		if($succes == TRUE )
		{
			echo json_encode(array("error_code"=>'200', 'response_string'=>'Submitted Successfully') );
			exit;
		}
		else{
			echo json_encode(array("error_code"=>$error_code, 'response_string'=>$error));
			exit;
		}
		
	}


	function dateConverter($var){
		$date = explode('/', $var);
		$final_date = $date['2'].'-'.$date['1'].'-'.$date['0'];
		return $final_date;
	}


	public function serverUrlAction()

	{
		$serverUrlData = json_decode(file_get_contents('php://input'), true);

		$Version	 = isset($serverUrlData['version'])?$serverUrlData['version']:"1.1.0";
		$error_code  = 400;
		$succes      = FALSE;
		try{
			if(!$Version){
				throw new Exception("Required parameter missing.");
			}

			$succes = TRUE;	
		}
		catch(Exception $e){

			$error= $e->getMessage();
		}
		
		if($succes == TRUE ){
			echo json_encode(array("error_code"=>'200', 'response_string'=>'Success.', 'serverurl'=>$this->siteurl));
			exit;
		}
		else{
			echo json_encode(array("error_code"=>$error_code, 'response_string'=>$error ));
			exit;
		}
		

	}


	public function saveDuplicateExpenseAction(){
		$db = $this->db;
		
		$params   = $this->getRequest()->getParams();
		$accessToken	= isset($params['local_token'])?$params['local_token']:"";
		$po_no	 	    = isset($params['po_no'])?$params['po_no']:"";
		$site_id	    = isset($params['site_id'])?$params['site_id']:"";
		$amount     	= isset($params['amount'])?$params['amount']:"";
		$transfer_for	= isset($params['transfer_for'])?$params['transfer_for']:"";
		$transfered_to  = isset($params['transfered_to'])?$params['transfered_to']:"";
		$transfer_date	= isset($params['transfer_date'])?$params['transfer_date']:"";
		$remark      	= isset($params['remark'])?$params['remark']:"";
		$form_type	        = isset($params['form_type'])?$params['form_type']:"";
		$state_for_two	    = isset($params['state_for_two'])?$params['state_for_two']:"";
		$amount_two     	= isset($params['amount_two'])?$params['amount_two']:"";
		$transfer_for_two	= isset($params['transfer_for_two'])?$params['transfer_for_two']:"";
		$transfered_to_two  = isset($params['transfered_to_two'])?$params['transfered_to_two']:"";
		$transfer_date_two	= isset($params['transfer_date_two'])?$params['transfer_date_two']:"";
		$remark_two     	= isset($params['remark_two'])?$params['remark_two']:"";
		$succes         = FALSE;
		$error_code  = 1;

		try{
			$db->beginTransaction();
			if($form_type == ''){
				$error_code  = 407;
				throw new Exception("form type not found");
			}		
			if(!$accessToken){
				$error_code  = 407;
				throw new Exception("Required parameter missing.");
			}
			$api = new Application_Model_Api();
			$allUserData = $api->getUserDetailByAccessToken($accessToken);
			if($allUserData['access_token'] != $accessToken){
				$error_code = 407;
				throw new Exception('You are not authorized for this device.');
			}

			if($allUserData['status'] != 1){
				$error_code = 407;
				throw new Exception('This account deactivated by admin.');
			}
			// $transferdate = $this->dateConverter($transfer_date);
			// $check_sql = "SELECT count(id) as count FROM tbl_expense WHERE po_no = '".$po_no."' AND 
			// site_id = '".$site_id."' AND transfer_date = '".$transferdate."' AND 
			// transfered_to = '".$transfered_to."' AND amount = '".$amount."' ";
			// $check_qry = $this->db->fetchRow($check_sql);

			// if($check_qry['count'] > 0){
			// 	$error_code  = 405;
			// 	throw new Exception("Data Already Exist.");
			// }

			$sql_statefor = "SELECT operating_unit as operating_unit FROM tbl_expense_report WHERE po_no = '".$po_no."' ";
			$qry_statefor = $this->db->fetchRow($sql_statefor);


			
			if($form_type=='0'){
				$dataArray = array();
				$dataArray['po_no']          = $po_no;
				$dataArray['site_id']        = $site_id;
				$dataArray['transfer_for']   = $transfer_for;
				$dataArray['state_for']      = $qry_statefor['operating_unit'];
				$dataArray['amount']         = $amount;
				$dataArray['transfer_date']  = $this->dateConverter($transfer_date);
				$dataArray['transfered_to']  = $transfered_to;
				$dataArray['created']        = date('Y-m-d H:i:s');
				$dataArray['remark']         = $remark;

				if( isset( $_FILES['attachment']['error'] ) ){
					if( $_FILES['attachment']['error'] == '0' ){
						move_uploaded_file($_FILES['attachment']['tmp_name'],"uploads/expense/".$_FILES['attachment']['name']);
						$dataArray['attachment'] = "/uploads/expense/".$_FILES['attachment']['name'];
					}else {
						$dataArray['attachment'] = "";  
					}
				}


				// echo '<pre>';
				// print_r($dataArray);exit;
				$this->db->insert('tbl_expense', $dataArray);
			}

			if($form_type=='1'){
				$dataArr = array();
				$dataArr['transfer_for']   = $transfer_for_two;
				$dataArr['state_for']      = $state_for_two;
				$dataArr['amount']         = $amount_two;
				$dataArr['transfer_date']  = $this->dateConverter($transfer_date_two);
				$dataArr['transfered_to']  = $transfered_to_two;
				$dataArr['created']        = date('Y-m-d H:i:s');
				$dataArr['remark']         = $remark_two;

				if( isset( $_FILES['attachment']['error'] ) ){
					if( $_FILES['attachment']['error'] == '0' ){
						move_uploaded_file($_FILES['attachment']['tmp_name'],"uploads/expense/".$_FILES['attachment']['name']);
						$dataArr['attachment'] = "/uploads/expense/".$_FILES['attachment']['name'];
					}else {
						$dataArr['attachment'] = "";  
					}
				}

				// echo '<pre>';
				// print_r($dataArr);exit;

				$this->db->insert('tbl_expense_office', $dataArr);
			}

			$db->commit();

			$succes = TRUE;	

		}catch(Exception $e){
			$error= $e->getMessage();
		}

		if($succes == TRUE )
		{
			echo json_encode(array("error_code"=>'200', 'response_string'=>'Submitted Successfully') );
			exit;
		}
		else{
			echo json_encode(array("error_code"=>$error_code, 'response_string'=>$error));
			exit;
		}
	}

	public function readNotificationsAction()
	{
		$params = json_decode(file_get_contents('php://input'), true);
		$response = array();
		$db = Zend_Db_Table::getDefaultAdapter();
		// $params = $this->getRequest()->getParams();
		$id = isset($params['id']) ? $params['id']:"";
		$status_change = array("is_read"=>"1");
		try{
			$db->beginTransaction();
			if ($id == '') {
				$response['flag'] = false;
				$response['satus_code'] = 400;
				$response['message'] = 'Id is required';
			}else{
				$db->update('tbl_notifications', $status_change, array('id=?'=>$id));
				$unread_query = "SELECT count(id) as unread_notification FROM tbl_notifications WHERE is_read = 0 AND DATE_FORMAT(created_at, '%Y-%m-%d') = curdate()";
				$result = $db->fetchRow($unread_query);

				$response['count'] = $result;
				$response['flag'] = true;
				$response['satus_code'] = 200;
				$response['message'] = 'Status updated successfully.';
			}
		}	
		catch(Exception $e)
		{
			$db->rollBack();
			$error= $e->getMessage();
			$response['flag'] = false;
			$response['satus_code'] = 400;
			$response['message'] = $error;

		}
		echo json_encode($response);
		exit();
	}

	public function getNotificationsAction()
	{
		$response = array();
		$db = Zend_Db_Table::getDefaultAdapter();
		$query = "SELECT  id, notification, is_read as status FROM tbl_notifications WHERE DATE_FORMAT(created_at, '%Y-%m-%d') = curdate()";
		$result = $db->fetchAll($query);
		$response['notification'] = $result;
		$response['status_code'] = 200;
		print_r(json_encode($response));
		exit;
	}

	public function totalNotificationsCountAction()
	{
		$response = array();
		$db = Zend_Db_Table::getDefaultAdapter();
		$query = "SELECT count(id) AS total_unread FROM tbl_notifications WHERE DATE_FORMAT(created_at, '%Y-%m-%d') = curdate() AND is_read='0'";
		$result = $db->fetchRow($query);
		$response['notification'] = $result;
		$response['status_code'] = 200;
		print_r(json_encode($response));
		exit;
	}

	public function workStartAction()
	{
		$params = json_decode(file_get_contents('php://input'), true);
		$response = array();
		$db = Zend_Db_Table::getDefaultAdapter();
		// $params = $this->getRequest()->getParams();
		$site_id = isset($params['site_id']) ? $params['site_id']:"";
		$po_no = isset($params['po_no']) ? $params['po_no']:"";
		// $id_query = "SELECT id FROM tbl_po_sites WHERE po_no='".$po_no."' AND site_id='".$site_id."'";
		// $id_result = $db->fetchRow($id_query);
		$status_change = array();
		$status_change['status'] = "3";
		try{
			$db->beginTransaction();
			if ($site_id == '') {
				$response['flag'] = false;
				$response['satus_code'] = 400;
				$response['message'] = 'Site Id is required';
			}else{
				$db->update('tbl_po_sites', $status_change, array('site_id=?'=>$site_id, 'po_no=?'=>$po_no));
				$status_query = "SELECT `po_no`, `site_id`,`status` FROM `tbl_po_sites` WHERE site_id = '".$site_id."' AND po_no='".$po_no."'";
				$status_result = $db->fetchRow($status_query);
				$response['status'] = $status_result['status'];
				$response['site_id'] = $status_result['site_id'];
				$response['flag'] = true;
				$response['satus_code'] = 200;
				$response['message'] = 'Status updated successfully.';
			}
		}	
		catch(Exception $e)
		{
			$db->rollBack();
			$error= $e->getMessage();
			$response['flag'] = false;
			$response['satus_code'] = 400;
			$response['message'] = $error;

		}
		echo json_encode($response);
		exit();
	}



	/**
	* index() method is used to api index
	* @param NULL
	* @return True 
	*/
	
	public function indexAction(){
		echo "Welcome api controller";
		exit;
	 // action body
	}
	
	public function expenseInAction(){
	$response = array();
		if($this->getRequest()->isPost()){

			$params = $this->getRequest()->getParams();
			try{
				$expense_in_query = "select *  from tbl_expense_in_type_master where status = 1 and expense_type_id = 1";
				$expense_in_result = $this->db->fetchAll($expense_in_query);
				
				$response['flag'] = true;
				$response['data'] = $expense_in_result;
			}catch(Exception $e){
				$response['flag'] = false;
				$response['message'] = $e->getMessage();
			}
		}else{
			$response['flag'] = false;
			$response['message'] = "Method not allowed";
		}

		echo json_encode($response);exit;
	}
	
	public function expenseForAction(){
	$response = array();
		if($this->getRequest()->isPost()){

			$params = $this->getRequest()->getParams();
// 			print_r($params);
// 			exit;
			try{
				$expense_for_query = "select *  from tbl_expense_transfer_for_master where status = 1 AND expense_type_id = 1 AND expense_in_id = '".$params['expense_in']."'";
				// echo $expense_for_query;
				// exit;
				$expense_for_result = $this->db->fetchAll($expense_for_query);
				$response['flag'] = true;
				$response['data'] = $expense_for_result;
			}catch(Exception $e){
				$response['flag'] = false;
				$response['message'] = $e->getMessage();
			}
		}else{
			$response['flag'] = false;
			$response['message'] = "Method not allowed";
		}

		echo json_encode($response);exit;
	}

	/**
	* setSecretHashKey() method is used to generate hash key
	* @return JSON
	* Created By : kriti singh
	* Created At : 17 july 2017
	*/
	protected function setSecretHashKey($data) {
		return base64_encode(serialize($data));
	}


	/**
	* getSecretHashKey() method is used to get hash key detail
	* @return JSON
	* Created By : kriti singh
	* Created At : 17 july 2017
	*/
	protected function getSecretHashKey($data) {
		return unserialize(base64_decode($data));
	}


	/**
	* loginAction() method is used to login user
	* @return JSON 
	* Created By : kriti singh
	* Created At : 17 july 2017
	*/


	public function loginAction(){ 
	   
		$db = $this->db;
		$loginData = json_decode(file_get_contents('php://input'), true); 
		$contact_no  = isset($loginData['contact_no'])?$loginData['contact_no']:""; 
		$latitude  = isset($loginData['latitude'])?$loginData['latitude']:"";
		$longitude  = isset($loginData['longitude'])?$loginData['longitude']:"";
		$device_id  = isset($loginData['device_id'])?$loginData['device_id']:"";
		$device_type = isset($loginData['device_type'])?$loginData['device_type']:"";
		$firebase_token = isset($loginData['firebase_token'])?$loginData['firebase_token']:"";
		$error_code = 1;
		$succes = FALSE; 
		try{
			$db->beginTransaction();
			if(!$contact_no || !$device_id)
			{
				$error_code  = 400;
				throw new Exception("Required parameter missing.");
			}
			$api = new Application_Model_Api();
			$allUserData = $api->getUserDetailByContactNo($contact_no);
			$allVendorData = $api->getVendorDetailByContactNo($contact_no);
			//$Transfer_for = $api->getTransferFor();
			$Transfer_to = $api->getTransferTo();
			//$Transfer_For_Office = $api->getTransferForTwo();
			$state_for = $api->getStateFor();
		 
			if($contact_no != $allUserData['contact_no'] and $contact_no != $allVendorData['contact_number']){
				$error_code  = 407;
				throw new Exception("Invalid Mobile No.");
			}
			if($allUserData['device_id']!=''){
				if($device_id !=$allUserData['device_id']){
					$error_code  = 407;
					throw new Exception("You are not authorized for this device");
				}
			}
			if($allVendorData['device_id']!=''){
				if($device_id !=$allVendorData['device_id']){
					$error_code  = 407;
					throw new Exception("You are not authorized for this device");
				}
			}
			if($allUserData['contact_no'] == $contact_no){
				$tokenArray = array();
				$tokenArray['contact_no'] = $contact_no;
				$tokenArray['device_id'] = $device_id;
				$accessToken = $this->setSecretHashKey($tokenArray);
				$update = array();
				if($latitude > '1' && $longitude > '1'){
					$update['latitude']          = $latitude;
					$update['longitude']         = $longitude;
				}
				$update['device_id']         = $device_id;
				$update['device_type']       = $device_type;
				$update['access_token']      = $accessToken;
				$update['gps_status']        = 'on';
				$update['login_time']        = $this->currdate;
				$update['updated']          = $this->currdate;
				$update['firebase_token']    = $firebase_token;
				$db->update('tbl_user',$update,array('id=?'=>$allUserData['id']));
				$Userdata = $api->getUserDetails($contact_no);	
			}elseif($allVendorData['contact_number'] = $contact_no){
				$tokenArray = array();
				$tokenArray['contact_number'] = $contact_no;
				$tokenArray['device_id'] = $device_id;
				$accessToken = $this->setSecretHashKey($tokenArray);
				$update = array();
				$update['latitude']          = $latitude;
				$update['longitude']         = $longitude;
				$update['device_id']         = $device_id;
				$update['device_type']       = $device_type;
				$update['access_token']      = $accessToken;
				$update['login_time']        = $this->currdate;
				$update['updated']          = $this->currdate;
				$db->update('tbl_vendor',$update,array('id=?'=>$allVendorData['id']));

				$Userdata = $api->getVendorDetails($contact_no);
			}

			/*$sql = "SELECT po_no ,description FROM tbl_expense_report";
			$po = $db->fetchAll($sql);
			$data = array();
			foreach ($po as $val) {
				$po_array = array();
				$po_array['po_no'] = htmlspecialchars($val['po_no']);
				$po_array['description'] = htmlspecialchars($val['description']);
				array_push($data, $po_array);
			}*/

			$count_site_array = array();
			$sql_count_site = "SELECT description as description from tbl_expense_report WHERE 1";
			$qry_count_site = $db->fetchAll($sql_count_site);
			foreach( $qry_count_site as $key_count_site ){
				$count_site_subarray = array('description'=>$key_count_site['description']);
				array_push($count_site_array,$count_site_subarray);
			}

			$arr = array(); $k=0;
			foreach ($count_site_array as $keysite) {
				$split_array = explode('-',$keysite['description']);
				for( $i=0; $i<sizeof($split_array); $i++ ){
					if( $i != '0' ){
						$arr[$k]=$split_array[$i];
						$k++;
					}
				}
			}

         //$arr2 = array();
         //$arr2 = array_unique($arr);
			$main_array= array();
// 			foreach(array_unique($arr) as $key => $value){
// 				$sql_po = "SELECT po_no as po_no from tbl_expense_report WHERE description LIKE '%".$value."%' ";
// 				$qry_po = $db->fetchAll($sql_po);
// 				$str = "";

// 				foreach ($qry_po as $ke => $va) {
// 					$str .=$va['po_no'].",";
// 				}

// 				$sub_array = array( 'site_id'=>$value , 'po_numbers' => $str );
// 				array_push($main_array,$sub_array);
// 			}

$sql_po = "SELECT po_no FROM tbl_po_details";
$qry_po = $db->fetchAll($sql_po);

foreach ($qry_po as $val) {
    $sub_array = array(
        'po_no' => $val['po_no']
    );
    array_push($main_array, $sub_array);
}
print_r($main_array);
			/*'po_no'=>$data,*/
			$db->commit();
			$succes = TRUE; 

		}
		catch(Exception $e){
			$db->rollBack();
			$error= $e->getMessage();
		 
		}

		if($succes == TRUE ){
		    
			echo json_encode(array("error_code"=>'200', 'response_string'=>'login success.', 'login_data'=>$Userdata,
		 
				//'Transfer_For_Office'=>$Transfer_For_Office , 
				'state_for'=>$state_for ,
				'Transfer_to'=>$Transfer_to , 'po_no'=>$qry_po ));
			exit;
		}
		else{
			echo json_encode(array("error_code"=>$error_code, 'response_string'=>$error ));
			exit;
		}
	}
public function getSitesByPoNumberAction()
{
    try{
        $db = $this->db;
        $params = json_decode(file_get_contents('php://input'), true);

        $po_number = isset($params['po_number']) ? $params['po_number'] : "";

        if(!$po_number){
            echo json_encode([
                "error_code" => 400,
                "response_string" => "PO number required"
            ]);
            exit;
        }

        $sql = "SELECT site_id FROM tbl_site_allocation 
                WHERE po_no = ? AND status = 1";

        $result = $db->fetchAll($sql, [$po_number]);

        $sites = [];

        foreach($result as $row){
            $sites[] = [
                "site_id" => $row['site_id']
            ];
        }

        echo json_encode([
            "error_code" => 200,
            "response_string" => "success",
            "sites" => $sites
        ]);

    }catch(Exception $e){

        echo json_encode([
            "error_code" => 500,
            "response_string" => $e->getMessage()
        ]);
    }

    exit;
}

	public function getAttendanceDataAction()
	{
//echo "sdfsf";exit;

		$db = $this->db;
		$attendanceData 	 =  json_decode(file_get_contents('php://input'), true);

		$contact_no 		 =  isset($attendanceData['contact_no'])?$attendanceData['contact_no']:"";
		$latitude 			 =  isset($attendanceData['latitude'])?$attendanceData['latitude']:"";
		$longitude 			 =  isset($attendanceData['longitude'])?$attendanceData['longitude']:"";
		$device_id 			 =  isset($attendanceData['device_id'])?$attendanceData['device_id']:"";
		$status 			 =  isset($attendanceData['status'])?$attendanceData['status']:"";
		$attendance_datetime =  isset($attendanceData['attendance_datetime'])?$attendanceData['attendance_datetime']:"";
		$user_type			 = 	isset($attendanceData['user_type'])?$attendanceData['user_type']:"";
        //echo $user_type;exit;		

		$error_code = 1;
		$succes = FALSE;
		//echo "user"; exit;
		try
		{


			$db->beginTransaction();
			if(!$contact_no || !$device_id){
				throw new Exception("Required parameter missing.");
			}
		         // echo "ok"; exit;

		  //        echo "ok";exit;

			$api = new Application_Model_Api();
			$allUserData = $api->getUserDetailByContactNo($contact_no);
				//print_r($allUserData);exit;
			$allVendorData = $api->getVendorDetailByContactNo($contact_no);

			if($contact_no !=$allUserData['contact_no'] and $contact_no !=$allVendorData['mobile']){
				$error_code  = 407;
				throw new Exception("Invalid Mobile No.");
			}

			// echo "ok"; exit;

		  // $date = date('Y-m-d');

		  //  $datetime = date('Y-m-d H:i:s');

	   //     $date_convert = date('Y-m-d', strtotime($attendance_datetime));
	   //       //print_r($date_convert); exit;
	   //     if($date != $date_convert)
		  //  {

		  //   throw new Exception('Invalid Date.');

		  //  }
         //  echo "ok";
         // print_r($date_convert); exit;

			$checkUserDayStart = $api->checkUserDayStart($contact_no, $date_convert);
         // echo "ok"; print_r($checkUserDayStart); exit;
			$checkVendorDayStart = $api->checkVendorDayStart($contact_no, $date_convert);
	       // echo "<pre>";
        // print_r($allVendorData); exit;
	    //    if($status=='1')
	    //     	{ 	
	    //     		//echo "user";exit;	
	    //     		//echo "status 1";exit;
	    //     		$attendanceArray = array();
		   //      	if($user_type == 'staff')
		   //      	{
		   //      		//echo "user";exit;	
	    //     			$attendanceArray['user_id']=$allUserData['id'];

	    //     		}
	    //     		if ($user_type == "vendor") 
	    //     		{

	    //     			$attendanceArray['user_id']=$allVendorData['id'];	
	    //     		}

	    //     		$attendanceArray['user_type']=$user_type;
	    //     		$attendanceArray['end_day_datetime']=$attendance_datetime;
	    //     		$attendanceArray['end_day_latitude']=$latitude;
	    //     		$attendanceArray['end_day_longitude']=$longitude;
	    //     		$attendanceArray['updated']=date('Y-m-d H:i:s');
	    //     		$attendanceArray['status']=0;
	    //     		//print_r($attendanceArray); exit;
	    //     		$where = array();
	    //     		$where[] = $this->db->quoteInto('contact_no = ?', $contact_no);
	    //     		$where[] = $this->db->quoteInto('date(start_day_datetime) = ?', $date_convert);
					// $db->update('tbl_staff_attendance', $attendanceArray, $where);
	    //     	}
	    //     	elseif($status=='0')

	    //     	{
	        	 //echo "vendor";	exit;
			if (empty($checkUserDayStart) || empty($checkVendorDayStart))
			{
				$attendanceArray = array();
				if($user_type == "staff")
				{
			        		//echo "user";exit;
					$attendanceArray['user_id']=$allUserData['id'];

				}
				elseif ($user_type == "vendor") 
				{

					$attendanceArray['user_id']=$allVendorData['id'];	
				}
		        		//$attendanceArray['user_type']=$allUserData['id'];
				$attendanceArray['user_type']=$user_type;
				$attendanceArray['contact_no']=$contact_no;
				$attendanceArray['start_day_datetime']=$attendance_datetime;
				$attendanceArray['start_day_latitude']=$latitude;
				$attendanceArray['start_day_longitude']=$longitude;
				$attendanceArray['status']=1;
				$attendanceArray['created']=date('Y-m-d H:i:s');

				$db->insert('tbl_staff_attendance',$attendanceArray);
			}
		        	//}
			$db->commit();
			$succes = TRUE;    
		}
		catch(Exception $e)
		{
	   //Rollback transaction
			$db->rollBack();

			$error= $e->getMessage();
		}
		if($succes == TRUE )
		{
			echo json_encode(array("error_code"=>'200', 'response_string'=>'User attended successfully.'));
			exit;
		}
		else
		{
			echo json_encode(array("error_code"=>$error_code, 'response_string'=>$error ));
			exit;
		}
	}

public function getBankAccountsAction()
{
    try{
        $db = $this->db;

        $sql = "SELECT id, bank_name, bank_account_number 
                FROM tbl_bank_accounts
                WHERE is_active = 1";

        $result = $db->fetchAll($sql);

        $banks = array();

        foreach($result as $row){
            $banks[] = array(
                "id" => $row['id'],
                "bank_name" => $row['bank_name'],
                "bank_account_number" => $row['bank_account_number']
            );
        }

        echo json_encode(array(
            "error_code" => 200,
            "response_string" => "success",
            "bank_accounts" => $banks
        ));

    }catch(Exception $e){

        echo json_encode(array(
            "error_code" => 500,
            "response_string" => $e->getMessage()
        ));
    }

    exit;
}

public function getPaymentModesAction()
{
    try{
        $db = $this->db;

        $sql = "SELECT id, payment_mode 
                FROM tbl_payment_modes
                WHERE is_active = 1";

        $result = $db->fetchAll($sql);

        $payment_modes = array();

        foreach($result as $row){
            $payment_modes[] = array(
                "id" => $row['id'],
                "payment_mode" => $row['payment_mode']
            );
        }

        echo json_encode(array(
            "error_code" => 200,
            "response_string" => "success",
            "payment_modes" => $payment_modes
        ));

    }catch(Exception $e){

        echo json_encode(array(
            "error_code" => 500,
            "response_string" => $e->getMessage()
        ));
    }

    exit;
}

public function getDebitAccountsAction()
{
    try{
        $db = $this->db;

        $sql = "SELECT id, debit_account 
                FROM tbl_debit_account
                WHERE is_active = 1";

        $result = $db->fetchAll($sql);

        $debit_accounts = array();

        foreach($result as $row){
            $debit_accounts[] = array(
                "id" => $row['id'],
                "debit_account" => $row['debit_account']
            );
        }

        echo json_encode(array(
            "error_code" => 200,
            "response_string" => "success",
            "debit_accounts" => $debit_accounts
        ));

    }catch(Exception $e){

        echo json_encode(array(
            "error_code" => 500,
            "response_string" => $e->getMessage()
        ));
    }

    exit;
}
	public function getTaskListAction(){

		$db = $this->db;
		$taskData 	= json_decode(file_get_contents('php://input'), true);

		$accessToken	= isset($taskData['access_token'])?$taskData['access_token']:"";
		$user_type		= 	isset($attendanceData['user_type'])?$attendanceData['user_type']:"";

		$succes      = FALSE;
		try{
			$db->beginTransaction();
			if(!$accessToken){
				$error_code  = 400;
				throw new Exception("Required parameter missing.");
			}


			$api = new Application_Model_Api();

			$allUserData = $api->getUserDetailByAccessToken($accessToken);
			$allVendorData = $api->getVendorDetailByAccessToken($accessToken); 	

			if($allUserData['access_token'] != $accessToken && $allVendorData['access_token'] != $accessToken)
			{
				$error_code = 407;
				throw new Exception('You are not authorized for this device.');
			}

			if($allUserData['status'] != 1 && $allVendorData['status'] != 1)
			{
				$error_code = 407;
				throw new Exception('This account deactivated by admin.');
			}
			      // echo "succes";
         //       // print_r($allUserData);
		       //    exit;

			//All questions

			$api = new Application_Model_Api();

			$getSiteAllocationStaffList = $api->getSiteAllocationList($allUserData['id']);
			$getSiteAllocationVendorList = $api->getSiteAllocationListByVendor($allVendorData['id']);
			if($getSiteAllocationStaffList){
				$getSiteAllocationList=$getSiteAllocationStaffList;
			}else{
				$getSiteAllocationList = $getSiteAllocationVendorList;
			}
			// echo "ok";
   //           print_r($getAllTask);
		 //         exit;

			$db->commit();
			$succes = TRUE;	
		}
		catch(Exception $e){

			$error= $e->getMessage();
		}
		
		if($succes == TRUE ){
			echo json_encode(array("error_code"=>'200', 'response_string'=>'success.', 'getSiteAllocationList'=>$getSiteAllocationList));
			exit;
		}
		else{
			echo json_encode(array("error_code"=>$error_code, 'response_string'=>$error ));
			exit;
		}
		

	}


	public function getTaskDetailsAction(){

		$db = $this->db;
		$siteData 	= json_decode(file_get_contents('php://input'), true);

		$accessToken			= isset($siteData['access_token'])?$siteData['access_token']:"";
		$site_allocation_id		= isset($siteData['site_allocation_id'])?$siteData['site_allocation_id']:"";

		$succes      = FALSE;
		try{
			$db->beginTransaction();
			if(!$accessToken){
				$error_code  = 400;
				throw new Exception("Required parameter missing.");
			}


			$api = new Application_Model_Api();

			$allUserData = $api->getUserDetailByAccessToken($accessToken);
			$allVendorData = $api->getVendorDetailByAccessToken($accessToken); 	

			if($allUserData['access_token'] != $accessToken && $allVendorData['access_token'] != $accessToken)
			{
				$error_code = 407;
				throw new Exception('You are not authorized for this device.');
			}

			if($allUserData['status'] != 1 && $allVendorData['status'] != 1)
			{
				$error_code = 407;
				throw new Exception('This account deactivated by admin.');
			}

			if($site_allocation_id == '')
			{
				$error_code = 407;
				throw new Exception('Missing Site Allocation Id.');
			}


			$api = new Application_Model_Api();
			$getSiteAllocationStaffDetails = $api->getSiteAllocationDetails($allUserData['id'], $site_allocation_id);
			$getSiteAllocationVendorDetails = $api->getSiteAllocationDetailsByVendor($allVendorData['id'], $site_allocation_id);
			if($getSiteAllocationStaffDetails){

				$getSiteAllocationDetails=$getSiteAllocationStaffDetails;
			}else{
				$getSiteAllocationDetails = $getSiteAllocationVendorDetails;
			}
			$db->commit();
			$succes = TRUE;
		}
		catch(Exception $e){

			$error= $e->getMessage();
		}

		if($succes == TRUE ){
			echo json_encode(array("error_code"=>'200', 'response_string'=>'success.', 'getSiteAllocationData'=>$getSiteAllocationDetails));
			exit;
		}
		else{
			echo json_encode(array("error_code"=>$error_code, 'response_string'=>$error ));
			exit;
		}


	}
	public function saveSiteImageAction(){

		$db = $this->db;
				// $otherData 	= json_decode(file_get_contents('php://input'), true);
		$params = $this->getRequest()->getParams();

		$accessToken			= isset($params['access_token'])?$params['access_token']:"";
		$site_allocation_id		= isset($params['site_allocation_id'])?$params['site_allocation_id']:""; 


		$succes      = FALSE;
		try{
			$db->beginTransaction();
			if(!$accessToken){
				$error_code  = 400;
				throw new Exception("Required parameter missing.");
			}


			$api = new Application_Model_Api();

			$allUserData = $api->getUserDetailByAccessToken($accessToken);
			$allVendorData = $api->getVendorDetailByAccessToken($accessToken); 	

			if($allUserData['access_token'] != $accessToken && $allVendorData['access_token'] != $accessToken)
			{
				$error_code = 407;
				throw new Exception('You are not authorized for this device.');
			}

			if($allUserData['status'] != 1 && $allVendorData['status'] != 1)
			{
				$error_code = 407;
				throw new Exception('This account deactivated by admin.');
			}
					   // echo "success";
        //         exit;

			$insertSiteImage = array();  
			if(isset($_FILES['photograph1']['tmp_name']) AND !empty($_FILES['photograph1']['tmp_name']))
			{
				$tempName 	= $_FILES['photograph1']['tmp_name'];
				$imageName 	= time().'001'.$_FILES['photograph1']['name']; 
				$uploads 	= 'uploads/site_photograph/';
				if(!file_exists($uploads)){
					mkdir($uploads);	
				}
				$pathComplete = $uploads.$imageName;
				@move_uploaded_file($tempName,$pathComplete);
				$insertSiteImage['site_photograph_1'] = $imageName;
                        // $this->db->insert('tbl_site_image', $insertSiteImage);

			}


			if(isset($_FILES['photograph2']['tmp_name']) AND !empty($_FILES['photograph2']['tmp_name']))
			{
				$tempName 	= $_FILES['photograph2']['tmp_name'];
				$imageName 	= time().'002'.$_FILES['photograph2']['name']; 
				$uploads 	= 'uploads/site_photograph/';
				if(!file_exists($uploads)){
					mkdir($uploads);	
				}
				$pathComplete = $uploads.$imageName;
				@move_uploaded_file($tempName,$pathComplete);
				$insertSiteImage['site_photograph_2'] = $imageName;

                          // $this->db->insert('tbl_site_image', $insertSiteImage);
			}


			if(isset($_FILES['photograph3']['tmp_name']) AND !empty($_FILES['photograph3']['tmp_name']))
			{
				$tempName 	= $_FILES['photograph3']['tmp_name'];
				$imageName 	= time().'003'.$_FILES['photograph3']['name']; 
				$uploads 	= 'uploads/site_photograph/';
				if(!file_exists($uploads)){
					mkdir($uploads);	
				}
				$pathComplete = $uploads.$imageName;
				@move_uploaded_file($tempName,$pathComplete);
				$insertSiteImage['site_photograph_3'] = $imageName;

	                          // $this->db->insert('tbl_site_image', $insertSiteImage);
			}


			if(isset($_FILES['signature1']['tmp_name']) AND !empty($_FILES['signature1']['tmp_name']))
			{
				$tempName 	= $_FILES['signature1']['tmp_name'];
				$imageName 	= time().'01'.$_FILES['signature1']['name']; 
				$uploads 	= 'uploads/site_signature/';
				if(!file_exists($uploads)){
					mkdir($uploads);	
				}
				$pathComplete = $uploads.$imageName;
				@move_uploaded_file($tempName,$pathComplete);
				$insertSiteImage['signature_1'] = $imageName;

		                          // $this->db->insert('tbl_site_image', $insertSiteImage);
			}


			if(isset($_FILES['signature2']['tmp_name']) AND !empty($_FILES['signature2']['tmp_name']))
			{
				$tempName 	= $_FILES['signature2']['tmp_name'];
				$imageName 	= time().'02'.$_FILES['signature2']['name']; 
				$uploads 	= 'uploads/site_signature/';
				if(!file_exists($uploads)){
					mkdir($uploads);	
				}
				$pathComplete = $uploads.$imageName;
				@move_uploaded_file($tempName,$pathComplete);
				$insertSiteImage['signature_2'] = $imageName;

                          // $this->db->insert('tbl_site_image', $insertSiteImage);
			}              

			$insertSiteImage['site_allocation_id'] = $site_allocation_id;
			$insertSiteImage['created'] = $this->currdate;	 			
			$db->insert('tbl_site_image', $insertSiteImage);	          
			$db->commit();
			$succes = TRUE;	
		}

		catch(Exception $e){
                //Rollback transaction
			$db->rollBack();
			$error= $e->getMessage();

		}

		if($succes == TRUE ){

			echo json_encode(array("error_code"=>'200', 'response_string'=>'Record has been saved Successfully.'));
			exit;
		}
		else{
			echo json_encode(array("error_code"=>$error_code, 'response_string'=>$error ));
			exit;
		}

	}
	public function saveSiteDataAction(){

		$db = $this->db;
		$siteData 				= json_decode(file_get_contents('php://input'), true);

		$accessToken			= isset($siteData['access_token'])?$siteData['access_token']:"";
		$nature_of_work     	= isset($siteData['nature_of_work'])?$siteData['nature_of_work']:"";
		$latitude     			= isset($siteData['latitude'])?$siteData['latitude']:"";
		$longitude     		= isset($siteData['longitude'])?$siteData['longitude']:"";
		$site_allocation_id    = isset($siteData['site_allocation_id'])?$siteData['site_allocation_id']:"";
		$user_type    			= isset($siteData['user_type'])?$siteData['user_type']:"";

		$succes      = FALSE;

		try{
			$db->beginTransaction();
			if(!$accessToken){
				$error_code  = 400;
				throw new Exception("Required parameter missing.");
			}


			$api = new Application_Model_Api();

			$allUserData 	= $api->getUserDetailByAccessToken($accessToken);
			$allVendorData 	= $api->getVendorDetailByAccessToken($accessToken); 	

			if($allUserData['access_token'] != $accessToken && $allVendorData['access_token'] != $accessToken)
			{
				$error_code = 407;
				throw new Exception('You are not authorized for this device.');
			}

			if($allUserData['status'] != 1 && $allVendorData['status'] != 1)
			{
				$error_code = 407;
				throw new Exception('This account deactivated by admin.');
			}



			foreach ($nature_of_work as $value) {
				$updateOtherWork = array();
				$updateOtherWork['status'] = '1';			
				$db->update('tbl_site_nature_of_work', $updateOtherWork,array('id=?'=>$value['id']));
			}

                    ///Update Site Status as complete
			$updateSite = array();
			$updateSite['status'] = '1';			
			$db->update('tbl_site_allocation', $updateSite,array('id=?'=>$site_allocation_id));

					///Update User lat/long 
			$updateUser = array();
			$updateUser['latitude'] = $latitude;
			$updateUser['longitude'] = $longitude;		
			if($user_type == 'staff'){
				$db->update('tbl_user', $updateUser,array('id=?'=>$allUserData['id']));
			}else{
				$db->update('tbl_vendor', $updateUser,array('id=?'=>$allVendorData['id']));
			}



			$db->commit();
			$succes = TRUE;
		}
		catch(Exception $e){

			$error= $e->getMessage();
		}

		if($succes == TRUE ){
			echo json_encode(array("error_code"=>'200', 'response_string'=>'success.'));
			exit;
		}
		else{
			echo json_encode(array("error_code"=>$error_code, 'response_string'=>$error ));
			exit;
		}				

	}


	public function saveUserPathAction(){

		$db = $this->db;
		$siteData 	= json_decode(file_get_contents('php://input'), true);

		$accessToken		 	= isset($siteData['access_token'])?$siteData['access_token']:"";
		$latitude			 	= isset($siteData['latitude'])?$siteData['latitude']:"";
		$longitude			 	= isset($siteData['longitude'])?$siteData['longitude']:"";
		$battery_status     	= isset($siteData['battery_status'])?$siteData['battery_status']:"";
		$travelled_distance 	= isset($siteData['travelled_distance'])?$siteData['travelled_distance']:"";
		$add_date_time			= isset($siteData['add_date_time'])?$siteData['add_date_time']:"";
		$move_status			= isset($siteData['move_status'])?$siteData['move_status']:"";
		$time_spend			= isset($siteData['time_spend'])?$siteData['time_spend']:"";
		$user_type    			= isset($siteData['user_type'])?$siteData['user_type']:"";

		$succes      = FALSE;

		try{
			$db->beginTransaction();
			if(!$accessToken){
				$error_code  = 400;
				throw new Exception("Required parameter missing.");
			}

			$api = new Application_Model_Api();
			$allUserData 	= $api->getUserDetailByAccessToken($accessToken);
			$allVendorData 	= $api->getVendorDetailByAccessToken($accessToken); 	

			if($allUserData['access_token'] != $accessToken && $allVendorData['access_token'] != $accessToken)
			{
				$error_code = 407;
				throw new Exception('You are not authorized for this device.');
			}

			if($allUserData['status'] != 1 && $allVendorData['status'] != 1)
			{
				$error_code = 407;
				throw new Exception('This account deactivated by admin.');
			}

			$insertUserPath = array();
			if($user_type == 'staff') {
				$insertUserPath['user_id']				=	$allUserData['id'];
			}else{
				$insertUserPath['user_id']				=	$allVendorData['id'];
			}

			$insertUserPath['user_type']			=	$user_type;
			$insertUserPath['latitude']				=	$latitude;
			$insertUserPath['longitude']			=	$longitude;
			$insertUserPath['battery_status']		=	$battery_status;
			$insertUserPath['travelled_distance']	=	$travelled_distance;
			$insertUserPath['add_date_time']		=	$add_date_time;
			$insertUserPath['move_status']			=	$move_status;
			$insertUserPath['time_spend']			=	$time_spend;
			$insertUserPath['created']				=	date('Y-m-d H:i:s');

			if($latitude > '1' && $longitude > '1'){
				$db->insert('tbl_user_path',$insertUserPath);
			}


			$db->commit();
			$succes = TRUE;
		}
		catch(Exception $e){

			$error= $e->getMessage();
		}

		if($succes == TRUE ){
			echo json_encode(array("error_code"=>'200', 'response_string'=>'User Record has been saved.'));
			exit;
		}
		else{
			echo json_encode(array("error_code"=>$error_code, 'response_string'=>$error ));
			exit;
		}


	}

	public function getJobCompletedDetailsAction(){

		$db = $this->db;
		$taskData 			= json_decode(file_get_contents('php://input'), true);

		$accessToken		= isset($taskData['access_token'])?$taskData['access_token']:"";
		$site_allocation_id = isset($taskData['site_allocation_id'])?$taskData['site_allocation_id']:"";

		$succes      = FALSE;
		try{
			$db->beginTransaction();
			if(!$accessToken){
				$error_code  = 400;
				throw new Exception("Required parameter missing.");
			}


			$api = new Application_Model_Api();

			$allUserData 	= $api->getUserDetailByAccessToken($accessToken);
			$allVendorData 	= $api->getVendorDetailByAccessToken($accessToken); 	

			if($allUserData['access_token'] != $accessToken && $allVendorData['access_token'] != $accessToken)
			{
				$error_code = 407;
				throw new Exception('You are not authorized for this device.');
			}

			if($allUserData['status'] != 1 && $allVendorData['status'] != 1)
			{
				$error_code = 407;
				throw new Exception('This account deactivated by admin.');
			}

			$api = new Application_Model_Api();

			$getSiteAllocationData = $api->getCompletedTaskByStatus($site_allocation_id);
			

			$db->commit();
			$succes = TRUE;	
		}
		catch(Exception $e){

			$error= $e->getMessage();
		}
		
		if($succes == TRUE ){
			echo json_encode(array("error_code"=>'200', 'response_string'=>'success.', 'getSiteAllocationData'=>$getSiteAllocationData));
			exit;
		}
		else{
			echo json_encode(array("error_code"=>$error_code, 'response_string'=>$error ));
			exit;
		}
	}

	/*--------------Admin APIs Start-----------------*/

	public function adminLoginAction(){ 
		$response = array();
		if($this->getRequest()->isPost()){
			$params = $this->getRequest()->getParams();
			$username  = isset($params['username'])?$params['username']:"";
			$password  = isset($params['password'])?$params['password']:"";
			$device_id  = isset($params['device_id'])?$params['device_id']:"";
			$firebase_token = isset($params['firebase_token'])?$params['firebase_token']:"";
			try{
				
				if(!$username){
					$response['flag'] = false;
					$response['message'] = "Username Missing";
				}else if(!$password){
					$response['flag'] = false;
					$response['message'] = "Password Missing";
				}else if(!$device_id){
					$response['flag'] = false;
					$response['message'] = "Device ID Missing";
				}else{
					$password 		= sha1(md5($params['password']));
					$sql = "SELECT * FROM tbl_user where email_id='".$params['username']."' and password ='".$password."' and role = 1";
					$result = $this->db->fetchRow($sql);
					if($result){
						$tokenArray = array();
						$tokenArray['device_id'] = $device_id;
						$accessToken = $this->setSecretHashKey($tokenArray);

						$update = array();
						$update['device_id']         = $device_id;
						$update['access_token']      = $accessToken;
						$update['login_time']        = $this->currdate;
						$update['updated']          = $this->currdate;
						$update['firebase_token']    = $firebase_token;
						$this->db->update('tbl_user',$update,array('id=?'=>$result['id']));

						$response['flag'] = true;
						$response['message'] = "Logged IN Successfully";
						$response['user'] = $result;

					}else{
						$response['flag'] = false;
						$response['message'] = "Invalid Credentials";
					}	
				}
			}catch(Exception $e){
				$response['flag'] = false;
				$response['message'] = $e->getMessage();
			}
		}else{
			$response['flag'] = false;
			$response['message'] = "Method not allowed";
		}
		echo json_encode($response);exit;

	}

	public function siteExpenseAction(){
		$response = array();
		if($this->getRequest()->isPost()){
			$params = $this->getRequest()->getParams();
			$year  = isset($params['year'])?$params['year']:date('Y');

			try{
				$months = array('01'=>'JAN','02'=>'FEB','03'=>'MAR','04'=>'APR','05'=>'MAY','06'=>'JUN','07'=>'JUL','08'=>'AUG','09'=>'SEP','10'=>'OCT','11'=>'NOV','12'=>'DEC');
				$yearlySiteExpense = array();
				foreach ($months as $key => $value) {
					$site_expense_query = "select sum(amount) as total from tbl_site_expense where transfer_date like '%".$year.'-'.$key."%'";
					$site_expense_result = $this->db->fetchRow($site_expense_query);
					if($site_expense_result && $site_expense_result['total'] > 0){
						array_push($yearlySiteExpense, array($value,$site_expense_result['total']));
					}else{
						array_push($yearlySiteExpense, array($value,0));
					}
				}

				$response['flag'] = true;
				$response['expense'] = $yearlySiteExpense;
			}catch(Exception $e){
				$response['flag'] = false;
				$response['message'] = $e->getMessage();
			}
		}else{
			$response['flag'] = false;
			$response['message'] = "Method not allowed";
		}

		echo json_encode($response);exit;

	}



	public function officeExpenseAction(){
		$response = array();
		if($this->getRequest()->isPost()){

			$params = $this->getRequest()->getParams();
			$year  = isset($params['year'])?$params['year']:date('Y');

			try{
				$months = array('01'=>'JAN','02'=>'FEB','03'=>'MAR','04'=>'APR','05'=>'MAY','06'=>'JUN','07'=>'JUL','08'=>'AUG','09'=>'SEP','10'=>'OCT','11'=>'NOV','12'=>'DEC');
				$yearlyOfficeExpense = array();
				foreach ($months as $key => $value) {
					$office_expense_query = "select sum(amount) as total from tbl_office_expense where is_deleted = 0 and transfer_date like '%".$year.'-'.$key."%'";
					$office_expense_result = $this->db->fetchRow($office_expense_query);
					if($office_expense_result && $office_expense_result['total'] > 0){
						array_push($yearlyOfficeExpense, array($value,$office_expense_result['total']));
					}else{
						array_push($yearlyOfficeExpense, array($value,0));
					}
				}	

				$response['flag'] = true;
				$response['expense'] = $yearlyOfficeExpense;
			}catch(Exception $e){
				$response['flag'] = false;
				$response['message'] = $e->getMessage();
			}
		}else{
			$response['flag'] = false;
			$response['message'] = "Method not allowed";
		}

		echo json_encode($response);exit;
	}



	public function invoiceDataAction(){
		$response = array();
		if($this->getRequest()->isPost()){

			$params = $this->getRequest()->getParams();
			$month  = isset($params['month'])?$params['month']:date('F');
			$year  = isset($params['year'])?$params['year']:date('Y');
			$invoice_data = array();
			try{
				$date = date_parse($month);
				$month = $date['month'];
				$month = $month < 10 ? "0".$month : $month;
				$amount_query = "Select tc.client_name ,ts.state_name ,sum(tp.invoice_value) as total from tbl_punched_invoice_details tp left join tbl_client_master tc on tp.client_id =tc.id left join tbl_states ts on ts.id =tc.state_id Where tp.invoice_date like '%".$year.'-'.$month."%' GROUP by tc.client_name";
				$amount_data = $this->db->fetchAll($amount_query);
				// echo "<pre>";print_r($amount_data);exit;
				if(!empty($amount_data)){
					foreach ($amount_data as $key => $amount) {
						array_push($invoice_data, array($amount['client_name'],$amount['state_name'],$amount['total']));
					}
				}else{
					array_push($invoice_data, array($value,0));
				}

				$response['flag'] = true;
				$response['invoice_data'] = $invoice_data;
			}catch(Exception $e){
				$response['flag'] = false;
				$response['message'] = $e->getMessage();
			}
		}else{
			$response['flag'] = false;
			$response['message'] = "Method not allowed";
		}

		echo json_encode($response);exit;
	}




	public function poDataAction(){
		$response = array();
		if($this->getRequest()->isPost()){

			$params = $this->getRequest()->getParams();
			$month  = isset($params['month'])?$params['month']:date('F');
			$year  = isset($params['year'])?$params['year']:date('Y');
			$po_data = array();
			try{
				$date = date_parse($month);
				$month = $date['month'];
				$month = $month < 10 ? "0".$month : $month;
				$amount_query = "Select tc.client_name ,ts.state_name ,sum(tp.po_amount) as total from tbl_po_details tp left join tbl_client_master tc on tp.client_id =tc.id left join tbl_states ts on ts.id =tc.state_id Where tp.order_date like '%".$year.'-'.$month."%' GROUP by tc.client_name";
				$amount_data = $this->db->fetchAll($amount_query);
				if(!empty($amount_data)){
					foreach ($amount_data as $key => $amount) {
						array_push($po_data, array($amount['client_name'],$amount['state_name'],$amount['total']));
					}
				}else{
					array_push($po_data, array($value,0));
				}
				$response['flag'] = true;
				$response['po_data'] = $po_data;
			}catch(Exception $e){
				$response['flag'] = false;
				$response['message'] = $e->getMessage();
			}
		}else{
			$response['flag'] = false;
			$response['message'] = "Method not allowed";
		}

		echo json_encode($response);exit;
	}



	public function invoiceAndExpenseAction(){
		$response = array();
		if($this->getRequest()->isPost()){
			try{
				$months = array('01'=>'JAN','02'=>'FEB','03'=>'MAR','04'=>'APR','05'=>'MAY','06'=>'JUN','07'=>'JUL','08'=>'AUG','09'=>'SEP','10'=>'OCT','11'=>'NOV','12'=>'DEC');

				
				$params = $this->getRequest()->getParams();
				$year  = isset($params['year'])?$params['year']:date('Y');
				
				$profit_loss = array();
				foreach ($months as $key => $value) {
					$profit = array();
					$sql_site_query ="select sum(tse.amount) as site_expense from tbl_site_expense tse  where
					tse.transfer_date like '%".$year.'-'.$key."%'";
					$site_amount = $this->db->fetchRow($sql_site_query);	
					$sql_office_query ="select sum(tfe.amount) as office_expense from tbl_office_expense tfe  where
					tfe.transfer_date like '%".$year.'-'.$key."%'";
					$office_amount = $this->db->fetchRow($sql_office_query);
					$sql_invoice_query ="select sum(invoice_value) as amount from tbl_punched_invoice_details   where invoice_date like '%".$year.'-'.$key."%'";
					$invoice_amount = $this->db->fetchRow($sql_invoice_query);	
					$sum =($site_amount['site_expense']+$office_amount['office_expense']);
					if($sum || $invoice_amount['amount'] ){
						if($invoice_amount['amount'] == 0){
							$invoice_amount['amount']=0;
						}
						array_push($profit,$invoice_amount['amount'],$sum,$value);
					}else{
						array_push($profit,0,0,$value);
					}
					$profit_loss[] = $profit;

				}

				$response['flag'] = true;
				$response['invoice_and_expense'] = $profit_loss;
			}catch(Exception $e){
				$response['flag'] = false;
				$response['message'] = $e->getMessage();
			}
		}else{
			$response['flag'] = false;
			$response['message'] = "Method not allowed";
		}

		echo json_encode($response);exit;
	}



	/*--------------Admin APIs End-------------------*/

}



?>