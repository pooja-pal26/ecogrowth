<?php 	

/**
 * 
 */
class Application_Model_ManagePoSite extends Zend_Db_Table_Abstract
{
	
	function __construct()
	{
		$this->db = Zend_Db_Table::getDefaultAdapter();
	}

	/*
	 * Function to get PO list related to state and client
	 * @param state_id, client_id
	 * Date : 06-07-2019
	 */
	public function getPoList($state_id, $client_id)
	{
		try {
			$poListQuery = $this->db->select()
			->from('tbl_po_details', array("*"))
			->where("state_id = ?", $state_id)
			->where("client_id = ?", $client_id)
			->where("is_deleted = ?", 0);
			$result = $this->db->fetchAll($poListQuery);
		} catch(Exception $e) {
			$result = $e->getMessage;
		}
		return $result;
	}

	// Function to get all PO list data
	public function getPoDetails()
	{
		try {
			$poDetailsQuery = $this->db->select()->from('tbl_po_details', array('*'))->order('id desc');
			$poDetailsResult = $this->db->fetchAll($poDetailsQuery);
		} catch(Exception $e) {
			echo $e->getMessage();
			exit;
		}
		return $poDetailsResult;
	}

	/* Function to get Site Details by site id
	 * @params site_id
	 */
	public function getSiteDetailsBySiteId($site_id)
	{
		try {
			$siteDetailsQuery = $this->db->select()->from('tbl_po_sites as tps', array('*'))
			->joinLeft('tbl_deployment as td','td.site_id = tps.site_id', array('*'))
			->where('tps.site_id = ?', $site_id);
			$siteDetailsResult = $this->db->fetchRow($siteDetailsQuery);
		} catch(Exception $e) {
			echo $e->getMessage();
			exit;
		}
		return $siteDetailsResult;
	}
}

?>