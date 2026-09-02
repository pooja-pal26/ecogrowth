<?php
/**
 * Logimetrix Techsolution Pvt. Ltd.
 * File Name   : AttendanceController.php
 * File Description  : Attendance Controller
 * Created By : Saumya & Arpita
 * Created Date: 01 Dec 2018
 */
class AttendanceController extends Zend_Controller_Action {
	var $dbAdapter;
	public function init() {
		$this->_flashMessenger  = $this->_helper->getHelper('FlashMessenger');
		$this->initView();
		$this->dbAdapter        = Zend_Db_Table::getDefaultAdapter(); 
		$auth                   = Zend_Auth::getInstance();
		$authStorage            = $auth->getStorage();

	}
	public function indexAction(){
		try{
			$date = date('Y-m-d');
			$this->view->messages     = $this->_flashMessenger->getMessages();
			$this->view->controller   = $this;
			$in_emp_query = "select id as employee_id,name,profile_path from  tbl_user where status=1 and role != 1 order by name desc";
			$this->view->in_employees = $in_employees = $this->dbAdapter->fetchAll($in_emp_query);
			$empSql = "select id from tbl_user where status='1' and role != 1 order by name asc ";
			$this->view->staff_result = $staff_result = $this->dbAdapter->fetchAll($empSql);
			$attendanceSettingSql = "select * from tbl_attendance_settings where 1 order by id desc ";
			$this->view->attendance_setting = $attendance_setting = $this->dbAdapter->fetchRow($attendanceSettingSql);
			$present_attendance = array();
			$absent_attendance = array();
			$leave_array = array();
			foreach ($staff_result as $value) {
				$absent = "select count(id) as total from tbl_staff_office_attendance where user_id='".$value['id']."' and DATE(start_date) = '".date('Y-m-d')."' ";
				$absent_result = $this->dbAdapter->fetchRow($absent);

				if($absent_result['total']){
					array_push($present_attendance,$absent_result);
				} else {
					array_push($absent_attendance, $absent_result);
				}
			}
			$this->view->total_present = count($present_attendance);
			$this->view->total_absent = count($absent_attendance);
		}catch(Exception $e){
			echo $e->getMessage();exit;
		}

		$this->getHelper('Layout')->disableLayout(); 
	}

	public function getEmployeeDataAction(){
		$params    = $this->getRequest()->getParams();
		$this->db = Zend_Db_Table::getDefaultAdapter();
		$employeeSql = "Select tu.id,tu.finger_iso_1,tu.finger_iso_2,tu.finger_iso_3,tu.finger_iso_4,tu.finger_iso_5, tts.day_end_time from tbl_attendance_settings as tts, tbl_user as tu
		where tu.id='".$params['employee_id']."'";
		$UserData = $this->db->fetchRow($employeeSql);
		$this->getHelper('Layout')->disableLayout();
		$this->getHelper('ViewRenderer')->setNoRender();
		$this->getResponse()->setHeader('Content-Type', 'application/json');
		echo json_encode($UserData);
		return; 
	}

	public function employeesMonthlyAttendanceAction()
	{
		$this->checklogin(); 
		try{
			$this->view->controller = $this;
			$params = $this->view->params = $this->getRequest()->getParams(); 
			$this->view->month = $month = date('m');
			$this->view->year = $year = date('Y');
			if ($this->getRequest()->isPost()) { 
				if($params['month']){
					$this->view->month = $month = $params['month'];
				}
				if($params['year']){
					$this->view->year = $year = $params['year'];
				}
			}
			$this->view->working_days = cal_days_in_month(CAL_GREGORIAN,$month,$year);
			$userNamesQuery = $this->dbAdapter->select()
			->from("tbl_user", array("id", "name"))
			->where("status = 1")
			->where("role_type != 1")
			->order("name asc");
			$this->view->userNames = $userNamesResult = $this->dbAdapter->fetchAll($userNamesQuery);
		}catch(Exception $e)
		{
			echo $e->getMessage();
			exit();
		}
	}
	public function viewEmployeesMonthlyAttendanceDetailsAction()
	{
		try {
			$this->checklogin();
			$this->view->controller = $this;
			$params = $this->getRequest()->getParams();
			$employeeNameQuery = $this->dbAdapter->select()
			->from('tbl_user', array('id','name'))
			->where('id = ?', $params['employee_id']);
			$this->view->employeeName = $employeeNameResult = $this->dbAdapter->fetchRow($employeeNameQuery);
			$this->view->month = $month = date('m'); 
			$this->view->year = $year = date('Y'); 
			if ($this->getRequest()->isPost()) {
				if (isset($params['month']) && !empty($params['month'])) {
					$this->view->month = $month = $params['month'];
				}
				if (isset($params['year']) && !empty($params['year'])) {
					$this->view->year = $year = $params['year'];
				}
			}
			$this->view->month_days = $month_days = cal_days_in_month(CAL_GREGORIAN, $month, $year);
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
		$this->_helper->layout()->disableLayout();
	}
	public function employeeAttendanceReportListAction(){
		$this->checklogin();
		try{
			$params                 = $this->view->params = $this->getRequest()->getParams(); 
			$this->view->controller = $this;
			$this->view->messages   = $this->_flashMessenger->getMessages();
			$employeeSql = "select id ,name from tbl_user where role !=1";
			$this->view->employees = $this->dbAdapter->fetchAll($employeeSql);
			if($params['month']){
				$this->view->month = $month = $params['month'];
			}else{
				$this->view->month = $month = date('m');
			}
			if($params['year']){
				$this->view->year = $year = $params['year'];
			}else{
				$this->view->year = $year = date('Y');
			}
			$this->view->working_days = $working_days = cal_days_in_month(CAL_GREGORIAN,$month,$year);
			if(isset($params['employee']) && $params['employee'] != ""){
				$this->view->emp_id = $emp_id = $params['employee'] ;
				$date = $year.'-'.$month;
			}
		}catch(Exception $e){
			echo $e->getMessage();exit;
		}
	}

	public function getInTime($emp_id,$date){
		$this->checklogin(); 
		$inTimeSql = "select  start_date  from tbl_staff_office_attendance  where user_id=".$emp_id."  and start_date LIKE '%".$date."%'";
		$result = $this->dbAdapter->fetchRow($inTimeSql);
		if($result){
			return date('H:i:s',strtotime($result['start_date']));
		}else{
			return '--';
		}
	}
	public function getOutTime($emp_id,$date){
		$this->checklogin(); 
		$outTimeSql = "select end_date from tbl_staff_office_attendance where user_id=".$emp_id." and status = 1 and start_date LIKE '%".$date."%'";
		$result = $this->dbAdapter->fetchRow($outTimeSql);
		if($result){
			return date('H:i:s',strtotime($result['end_date']));
		}else{
			return '--';
		}
	}

	public function calculateWorkingHour($emp_id,$date){
		$this->checklogin(); 
		$workingHourSql = "select TIMEDIFF(end_date, start_date) as working_hours from tbl_staff_office_attendance 
		where user_id=".$emp_id." and start_date LIKE '%".$date."%'";
		$result = $this->dbAdapter->fetchRow($workingHourSql);
		if($result){
			if(is_null($result['working_hours'])){
				return '--';
			}else{
				return $result['working_hours'];
			}
		}else{
			return '0';
		}
	}

	public function checkAttendance($emp_id, $date){ 
		$sql = "select * from tbl_staff_office_attendance where user_id =".$emp_id." and start_date LIKE '%".$date."%'";
		$result = $this->dbAdapter->fetchRow($sql);
		if($result){
			if ($result['start_date'] != NULL || !empty($result['start_date'])) {
				$result['start_time'] = date('H:i:s', strtotime($result['start_date']));
			} else {
				$result['start_time'] = '-';
			}
			if ($result['end_date'] != NULL || !empty($result['end_date'])) {
				$start_time = strtotime(date('H:i:s', strtotime($result['start_date'])));
				$end_time = strtotime(date('H:i:s', strtotime($result['end_date'])));
				$time_diff = $end_time - $start_time;
				$working_sec = $time_diff % 60; // working seconds in working hours
				$temp_min = ($time_diff / 60);  // converted temporary minutes from total time difference 
				$working_min = ((int)$temp_min % 60); // working minutes in working hours
				$working_hours = ((int)$temp_min / 60); // working hours
				$hours = (int)$working_hours < 10 ? '0'.(int)$working_hours:(int)$working_hours;
				$minutes = $working_min < 10 ? '0'.$working_min:$working_min;
				$seconds = $working_sec < 10 ? '0'.$working_sec:$working_sec;
				$result['working_hours'] = $hours.':'.$minutes.':'.$seconds;
				$result['end_time'] = date('H:i:s', strtotime($result['end_date']));
			} else {
				$result['working_hours'] = '-';
				$result['end_time'] = '-';
			}
			return $result;
		}
	}
	public function checkSunday($date){
		$day = date("D", strtotime($date));
		if($day == 'Sun'){
			return true;
		}else{
			return false;
		}
	}



	public function markAttendanceAction(){
		try{

			$id =  $this->_getParam('id');
			$status =  $this->_getParam('status');
			$db = Zend_Db_Table::getDefaultAdapter();
			$date = date('Y-m-d');
			if($status == 1){
				$Query = "select * from tbl_staff_office_attendance where user_id='".$id."' and DATE(start_date) = '".date('Y-m-d')."' and status='0'";
				$UserData = $this->dbAdapter->fetchRow($Query);
			}

			if($id!=''){
				$attendanceArray = array();
				if($status == 0){
					$checkAttendanceSql =  "select * from tbl_staff_office_attendance where user_id='".$id."' and DATE(start_date) = '".date('Y-m-d')."' and end_date IS NULL and status='0'";
					$attendanceResult = $this->dbAdapter->fetchAll($checkAttendanceSql);
					if(!$attendanceResult){
						$attendanceArray['user_id']    = $id;
						$attendanceArray['start_date']   = date('Y-m-d H:i:s');
						$attendanceArray['status']   = $status;
						$this->dbAdapter->insert('tbl_staff_office_attendance', $attendanceArray);
					}
				}else{
					$attendanceArray['end_date']   = date('Y-m-d H:i:s');
					$attendanceArray['status']   = $status;
					$where = array(
						'user_id=?'=>$id,
						'id=?'=>$UserData['id']
					);
					$this->dbAdapter->update('tbl_staff_office_attendance',$attendanceArray,$where);
				}
			}

		}catch(Exception $e){
			echo $e->getMessage(); exit;
		}

		$Query1 = "select * from tbl_user where id='".$id."'";
		$UserData1 = $this->dbAdapter->fetchRow($Query1);

		$this->getHelper('Layout')->disableLayout();
		$this->getHelper('ViewRenderer')->setNoRender();
		$this->getResponse()->setHeader('Content-Type', 'application/json');
		echo json_encode($UserData1);
		return; 
	}
	public function checklogin(){   
		$auth           = Zend_Auth::getInstance(); 
		$errorMessage   = ""; 
		if(!$auth->hasIdentity()){
			$this->_redirect('/');  
		}   
	}
}
?>
