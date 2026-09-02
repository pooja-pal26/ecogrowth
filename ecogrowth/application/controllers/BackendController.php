<?php 

/**
 * File Name : 		Backend Controller
 * Description :	This controller enables admin to update such data which is not done by regular * 				way. 
 * File Date : 		24/04/2019
 * Created By : 	Amit Chaurasiya
 */
class BackendController extends Zend_Controller_Action
{
	public function init() // Intializes all the necessary data
	{
		$this->dbAdapter 	= Zend_Db_Table::getDefaultAdapter();
		$this->auth 		= Zend_Auth::getInstance();
		$authStorage 		= $this->auth->getStorage();
		$this->id 			= $authStorage->read()->id;
		$this->role_type 	= $authStorage->read()->role_type;
		$this->role 		= $authStorage->read()->role;
	}

	public function indexAction()
	{
		try {
			$this->checklogin(); // check session data if not then redirected to login page
			if ($this->role != 1) {
				echo "Invalid Access!";
				exit;
			}
		} catch(Exception $e) {
			echo $e->getMessage();
			exit;
		}
	}
	public function userAttendanceAction() // user attendance data for current day
	{
		try {
			$this->checklogin();
			if ($this->role != 1) {
				echo "Invalid Access!";
				exit;
			}
			$getUserListQuery = $this->dbAdapter->select()
			->from('tbl_user', array('id','name'))
			->where('status = 1')
			->where('role_type != 1')
			->where('role != 1')
			->order('name asc');
			$this->view->userList = $getUserListResult = $this->dbAdapter->fetchAll($getUserListQuery);
			$userAttendanceArray = array();
			foreach ($getUserListResult as $user) {
				$getTodayAttendanceQuery = $this->dbAdapter->select()
				->from('tbl_staff_office_attendance', array('start_date','end_date'))
				->where('start_date like ?', date('Y-m-d').'%')
				->where('user_id = ?', $user['id']);
				$getTodayAttendanceResult = $this->dbAdapter->fetchRow($getTodayAttendanceQuery);
				$user['start_date'] = $getTodayAttendanceResult['start_date'];
				$user['end_date']   = $getTodayAttendanceResult['end_date'];
				array_push($userAttendanceArray, $user);
			}
			$this->view->userAttendance = $userAttendanceArray;
			$params = $this->getRequest()->getParams();
			if ($this->getRequest()->isPost()) {
				echo "<pre>";
				print_r($params);exit;
			}
		} catch(Exception $e) {
			echo $e->getMessage();
			exit;
		}
	}
	public function markAttendanceAction()
	{
		try {
			$this->checklogin();
			$response = array();
			$backend = new Application_Model_Backend();
			if ($this->role != 1) {
				echo "Invalid Access!";
				exit;
			}
			$params = $this->getRequest()->getParams();
			if ($this->getRequest()->isPost()) {
				$i = 0;
				foreach ($params['employee_id'] as $key => $employee) {
					$getAttendanceData = $backend->getAttendanceData($employee, $this->dateConverter($params['start_time'][$i]));
					if (!$getAttendanceData) {
						$insertData = array();
						$insertData['user_id'] = $employee;
						$insertData['start_date'] = $this->dateConverter($params['start_time'][$i]);
						if ($params['end_time']) {
							$insertData['end_date'] = $this->dateConverter($params['end_time'][$i]);
						}
						$insertData['status']   = '1';
						$this->dbAdapter->insert('tbl_staff_office_attendance', $insertData);
					}
					$i++;
				}
				$response['flag'] = true;
				$response['title'] = 'Marked Successfully';
				$response['message'] = "Attendance has been marked successfully.";
			} else {
				$response['flag'] = false;
				$response['title'] = 'Invalid Request Type!';
				$response['message'] = "Please try again after refreshing the page.";
			}
		} catch(Exception $e) {
			$response['flag'] = false;
			$response['title'] = 'Internal Server Error!';
			$response['message'] = $e->getMessage();
		}
		echo json_encode($response);
		exit;
	}



	public function updateInventoryAction()
	{
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$productTypeQuery = $this->dbAdapter->select()->from('tbl_product_type', array('*'));
		$this->view->productType = $productTypeResult = $this->dbAdapter->fetchAll($productTypeQuery);
		$materialBrandQuery = $this->dbAdapter->select()->from('tbl_material_brand', array('*'));
		$this->view->materialBrand = $materialBrandResult = $this->dbAdapter->fetchAll($materialBrandQuery);

		if ($this->getRequest()->isPost()) {
			try {
				$i = 0;
				// echo "<pre>";
				// print_r($params);
				// exit;
				foreach ($params['product_category'] as $key => $value) {

					$inventorySql = "select * from tbl_inventory where product_type_id=".$params['product_category'][$i]." and product_id=".$params['product_id'][$i]." and unit='".$params['product_id'][$i]."'";
					$inventory = $this->dbAdapter->fetchRow($inventorySql);
					if ($inventory) {
						$updateData = array();
						$updateData['quantity'] = $inventory['quantity'] + $params['quantity'][$i];
						$where = array();
						$where['id=?'] = $inventory['id'];
						$this->dbAdapter->insert('tbl_inventory', $updateData,$where);
					}else{
						$insertData = array();
						$insertData['product_type_id'] = $params['product_category'][$i];
						$insertData['product_id'] = $params['product_id'][$i];
						$insertData['brand_name'] = $params['brand'][$i];
						$insertData['unit'] = $params['unit'][$i];
						$insertData['quantity'] = $params['quantity'][$i];
						$this->dbAdapter->insert('tbl_inventory', $insertData);
					}
					$i++;
				}
				$this->_redirect('/backend/update-inventory');
			}  catch(Exception $e) {
				echo  $e->getMessage();exit;
			}
		}
	}

	public function dateConverter($date)
	{
		$tempArray = explode(' ', $date);
		$tempDate = explode('/', $tempArray[0]);
		$newDate = $tempDate[2].'-'.$tempDate[1].'-'.$tempDate[0].' '.$tempArray[1];
		return $newDate;

	}
	public function checklogin()
	{
		if (!$this->auth->hasIdentity()) { // checks session data has identity or not
			$this->_redirect('/index'); 
		}
	}
}

?>