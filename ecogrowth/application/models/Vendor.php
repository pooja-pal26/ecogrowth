<?php 

/*
 * Logimetrix Techsolution Pvt. Ltd.
 * File Name   		: Vendor.php
 * File Description : Vendor Model
 * Created By 		: Amit Chaurasiya
 * Created Date 	: 27 March, 2019 
 */
class Application_Model_Vendor extends Zend_Db_Table_Abstract
{
	
	function __construct()
	{
		$this->db = Zend_Db_Table::getDefaultAdapter();
	}

	/* 
	 * Method returns the vendor data if exists
	 * @params : array of conditions
	 */
	public function checkDuplicateVendorData($params = array())
	{
		try {
			if (array_key_exists('id', $params)) {
				$vendorNameQuery = $this->db->select()
				->from('tbl_vendor as tv', array('vendor_name','id'))
				->joinLeft('tbl_vendor_bank_and_gst_details as tvbd','tvbd.vendor_id', array('pan_number'))
				->where('tv.vendor_name = ?', $params['vendor_name'])
				->where('tvbd.pan_number = ?', $params['pan_card_number'])
				->where('tv.id != ?', $params['id']);
				$vendorNameResult = $this->db->fetchRow($vendorNameQuery);
			} else {	
				$vendorNameQuery = $this->db->select()
				->from('tbl_vendor as tv', array('vendor_name','id'))
				->joinLeft('tbl_vendor_bank_and_gst_details as tvbd','tvbd.vendor_id', array('pan_number'))
				->where('tv.vendor_name = ?', $params['vendor_name'])
				->where('tvbd.pan_number = ?', $params['pan_card_number']);
				$vendorNameResult = $this->db->fetchRow($vendorNameQuery);
			}
			return $vendorNameResult;
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
	}
}

?>