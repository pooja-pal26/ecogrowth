<?php 

/**
 * File Name : Master.php
 * File Type : Master Model
 * Created By : Amit Chaurasiya
 * Created Date : 11-Feb-2019
 * 
 */
class Application_Model_Master extends Zend_Db_Table_Abstract
{
	
	function __construct()
	{
		$this->dbAdapter = Zend_Db_Table::getDefaultAdapter();
	}

	// Function to get State Master List 
	public function getStateNameMasterList()
	{
		try {
			$stateNameMasterListQuery = $this->dbAdapter->select()
			->from("tbl_states", array("id","state_name"))
			->where("is_active = 1")
			->order("state_name asc");
			$result = $this->dbAdapter->fetchAll($stateNameMasterListQuery);
		} catch(Exception $e){
			$result = $e->getMessage();
		}
		return $result;
	}
	/*
	 * Function to check valid state id
	 * @param state_id
	 * Date : 06-07-2019 
	 */ 
	public function checkValidStateId($state_id)
	{
		try {
			$validateStateIdQuery = $this->dbAdapter->select()
			->from("tbl_states", array("id"))
			->where("is_active = 1")
			->where("id = ?", $state_id);
			$result = $this->dbAdapter->fetchRow($validateStateIdQuery);
			if ($result)
				return true;
			else 
				return false;
		} catch(Exception $e){
			$result = $e->getMessage();
			return $result;
		}
	}
	/* Function to get State Name 
	@param state_id
	*/
	public function getStateNameByStateId($state_id)
	{
		try {
			$stateNameQuery = $this->dbAdapter->select()
			->from("tbl_states", array("state_name","state_code"))
			->where("id = ?", $state_id);
			$result = $this->dbAdapter->fetchRow($stateNameQuery);
		} catch(Exception $e){
			$result = $e->getMessage();
		}
		return $result;
	}
// Function to get Client Master List 
	public function getClientMasterList()
	{
		try {
			$clientMasterListQuery = $this->dbAdapter->select()
			->from("tbl_client_master", array("id","client_name"))
			->where("is_active = 1")
			->order("client_name asc");
			$result = $this->dbAdapter->fetchAll($clientMasterListQuery);
		} catch(Exception $e){
			$result = $e->getMessage();
		}
		return $result;
	}
	/*
	 * Function to check valid client id
	 * @param client_id
	 * Date : 06-07-2019 
	 */ 
	public function checkValidClientId($client_id)
	{
		try {
			$validateClientIdQuery = $this->dbAdapter->select()
			->from("tbl_client_master", array("id"))
			->where("is_active = 1")
			->where("id = ?", $client_id);
			$result = $this->dbAdapter->fetchRow($validateClientIdQuery);
			if ($result)
				return true;
			else 
				return false;
		} catch(Exception $e){
			$result = $e->getMessage();
			return $result;
		}
	}
	/* Function to get client details 
	 * @ params client_id
	 */
	public function getClientDetailsById($client_id)
	{
		try {
			$clientDetailsQuery = $this->dbAdapter->select()
			->from("tbl_client_master as tcm", array("*"))
			->joinLeft('tbl_states as ts','ts.id = tcm.state_id', array('state_name','state_code'))
			->where("tcm.id = ?", $client_id)
			->where("tcm.is_active = 1");
			$result = $this->dbAdapter->fetchRow($clientDetailsQuery);
		} catch(Exception $e){
			$result = $e->getMessage();
		}
		return $result;
	}
	/* Function to get client details by state 
	 * @ params state_id
	 */
	public function getClientDetailsByStateId($state_id)
	{
		try {
			$clientDetailsQuery = $this->dbAdapter->select()
			->from("tbl_client_master as tcm", array("id","client_name"))
			->where("tcm.state_id = ?", $state_id)
			->where("tcm.is_active = 1");
			$result = $this->dbAdapter->fetchAll($clientDetailsQuery);
		} catch(Exception $e){
			$result = $e->getMessage();
		}
		return $result;
	}
	// Function to get Bank Name Master List
	public function getBankNameMasterList()
	{
		try {
			$bankNameMasterListQuery = $this->dbAdapter->select()
			->from("tbl_bank_master", array("id","bank_name"))
			->where("is_active = 1")
			->order("bank_name asc");
			$result = $this->dbAdapter->fetchAll($bankNameMasterListQuery);
		} catch(Exception $e){
			$result = $e->getMessage();
		}
		return $result;
	}

	// Function to get Relative Experience Master list for Vendor registration
	public function getRelativeExperienceMasterList()
	{
		try {
			$relativeExperienceMasterListQuery = $this->dbAdapter->select()
			->from("tbl_vendor_experience_master", array("id", "experience"))
			->where("is_active = 1");
			$result = $this->dbAdapter->fetchAll($relativeExperienceMasterListQuery);
		} catch(Exception $e){
			$result =  $e->getMessage();
		}
		return $result;
	}
	public function getOrganizationTypeMasterList()
	{
		try {
			$organizationTypeMasterListQuery = $this->dbAdapter->select()
			->from("tbl_organization_type_master", array("id", "organization_type"))
			->where("is_active = 1");
			$result = $this->dbAdapter->fetchAll($organizationTypeMasterListQuery);
		} catch(Exception $e){
			$result =  $e->getMessage();
		}
		return $result;
	}
	public function getAssociationYearsMasterList()
	{
		try {
			$associationYearsMasterListQuery = $this->dbAdapter->select()
			->from("tbl_association_years_master", array("id", "association_years"))
			->where("is_active = 1");
			$result = $this->dbAdapter->fetchAll($associationYearsMasterListQuery);
		} catch(Exception $e){
			$result =  $e->getMessage();
		}
		return $result;
	}
	public function getGeographicalPresenceMasterList()
	{
		try {
			$geographicalPresenceMasterListQuery = $this->dbAdapter->select()
			->from("tbl_vendor_geographical_presence_master", array("id", "geographical_presence"))
			->where("is_active = 1");
			$result = $this->dbAdapter->fetchAll($geographicalPresenceMasterListQuery);
		} catch(Exception $e){
			$result =  $e->getMessage();
		}
		return $result;
	}
	public function getMajorClientsMasterList()
	{
		try {
			$majorClientsMasterListQuery = $this->dbAdapter->select()
			->from("tbl_vendor_major_clients_master", array("id", "major_clients"))
			->where("is_active = 1");
			$result = $this->dbAdapter->fetchAll($majorClientsMasterListQuery);
		} catch(Exception $e){
			$result =  $e->getMessage();
		}
		return $result;
	}
	public function getTeamStrengthMasterList()
	{
		try {
			$teamStrengthMasterListQuery = $this->dbAdapter->select()
			->from("tbl_vendor_team_strength_master", array("id", "team_strength"))
			->where("is_active = 1");
			$result = $this->dbAdapter->fetchAll($teamStrengthMasterListQuery);
		} catch(Exception $e){
			$result =  $e->getMessage();
		}
		return $result;
	}
	public function getAnnualTurnoverMasterList()
	{
		try {
			$annualTurnoverMasterListQuery = $this->dbAdapter->select()
			->from("tbl_annual_turnover_master", array("id", "annual_turnover"))
			->where("is_active = 1");
			$result = $this->dbAdapter->fetchAll($annualTurnoverMasterListQuery);
		} catch(Exception $e){
			$result =  $e->getMessage();
		}
		return $result;
	}
	public function getWorkHandlingAmountMasterList()
	{
		try {
			$workHandlingAmountMasterListQuery = $this->dbAdapter->select()
			->from("tbl_work_handling_amount_master", array("id", "work_handling_amount"))
			->where("is_active = 1");
			$result = $this->dbAdapter->fetchAll($workHandlingAmountMasterListQuery);
		} catch(Exception $e){
			$result =  $e->getMessage();
		}
		return $result;
	}
	/*-----------------------------END : VENDOR MASTER DATA-----------------------------*/
	/***** METHOD-START : Nature of Work ******/ 

	/*
	 * Method to check duplicacy of nature of work
	 */
	public function getNatureOfWork($params = array())
	{
		try {
			if (array_key_exists('id', $params)) {
				$natureOfWorkQuery = $this->dbAdapter->select()
				->from('tbl_nature_of_work', array('nature_of_work'))
				->where('id = ?', $params['id']);
				$result = $this->dbAdapter->fetchRow($natureOfWorkQuery);
			} else if (array_key_exists('natureOfWork', $params)) {
				$natureOfWorkQuery = $this->dbAdapter->select()
				->from('tbl_nature_of_work', array('nature_of_work'))
				->where('nature_of_work = ?', $params['natureOfWork']);
				$result = $this->dbAdapter->fetchRow($natureOfWorkQuery);
			}
		} catch(Exception $e){
			$result = $e->getMessage();
		}
		return $result;
	}
	public function getNatureOfWorkById($nature_of_work_id)
	{
		try {
			$natureOfWorkQuery = $this->dbAdapter->select()
			->from('tbl_nature_of_work', array('nature_of_work'))
			->where('id = ?', $nature_of_work_id);
			$result = $this->dbAdapter->fetchRow($natureOfWorkQuery);
		} catch(Exception $e){
			$result = $e->getMessage();
		}
		return $result;
	}
	/***** METHOD-END : Nature of Work ******/ 
	public function getExpenseInNameById($expense_in_id)
	{
		try {
			$expenseInNameQuery = $this->dbAdapter->select()
			->from('tbl_expense_in_type_master', array('expense_in_type'))
			->where('id = ?', $expense_in_id);
			$result = $this->dbAdapter->fetchRow($expenseInNameQuery);
		} catch(Exception $e){
			$result = $e->getMessage();
		}
		return $result;
	}
	public function getExpenseForNameById($expense_for_id)
	{
		try {
			$expenseForNameQuery = $this->dbAdapter->select()
			->from('tbl_expense_transfer_for_master', array('expense_transfer_for'))
			->where('id = ?', $expense_for_id);
			$result = $this->dbAdapter->fetchRow($expenseForNameQuery);
		} catch(Exception $e){
			$result = $e->getMessage();
		}
		return $result;
	}
}

?>