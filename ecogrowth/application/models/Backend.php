<?php 

/**
 * 
 */
class Application_Model_Backend extends Zend_Db_Table_Abstract
{
	
	function init()
	{
		$this->db = Zend_Db_Table::getDefaultAdapter();
	}

	public function getAttendanceData($user_id, $start_date)
	{
		try {
			$attendanceDataQuery = $this->db->select()
			->from('tbl_staff_office_attendance', array('*'))
			->where('user_id = ?', $user_id)
			->where('start_date like ?', date('Y-m-d', strtotime($start_date)).'%');
			$attendanceDataResult = $this->db->fetchRow($attendanceDataQuery);
		} catch(Exception $e) {
			echo $e->getMessage();
			exit;
		}
		return $attendanceDataResult;
	}
}

?>