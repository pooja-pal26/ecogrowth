<?php 

/**
 * 
 */
class Application_Model_Invoice extends Zend_Db_Table_Abstract
{
	
	function __construct()
	{
		$this->dbAdapter = Zend_Db_Table::getDefaultAdapter();
	}

	// Function to get services or products master list
	public function getInvoiceServicesProductsMasterList()
	{
		try {
			$getInvoiceServicesListQuery = $this->dbAdapter->select()
			->from('tbl_invoice_services_master', array('id','name_of_service'))
			->where('is_active = 1');
			$result = $this->dbAdapter->fetchAll($getInvoiceServicesListQuery);
		} catch(Exception $e) {
			echo $e->getMessage();
			exit;
		}
		return $result;
	}

	// Function to get invoice services and products list
	public function getServiceProductDetailsByServiceId($service_id)
	{
		try {
			$serviceProductDetailsQuery = $this->dbAdapter->select()
			->from('tbl_invoice_services_master as tism', array('*'))
			->joinLeft('tbl_states as ts','ts.id = tism.state_id', array('state_name'))
			->joinLeft('tbl_client_master as tcm','tcm.id = tism.client_id',array('client_name'))
			->where('tism.id = ?', $service_id)
			->where('tism.is_active = 1');
			$result = $this->dbAdapter->fetchRow($serviceProductDetailsQuery);
		} catch(Exception $e) {
			echo $e->getMessage();
			exit;
		}
		return $result;
	}

	/* Function to check valid service id if true returns service details 
 	 * @params service_id
 	 */
	public function checkValidServiceId($service_id)
	{
		
	}
 	/* Function to convert number into indian words counting
 	 * @params number
 	 */
 	function getIndianCurrency($number)
 	{
 		$decimal = round($number - ($no = floor($number)), 2) * 100;
 		$hundred = null;
 		$digits_length = strlen($no);
 		$i = 0;
 		$str = array();
 		$words = array(0 => '', 1 => 'one', 2 => 'two',
 			3 => 'three', 4 => 'four', 5 => 'five', 6 => 'six',
 			7 => 'seven', 8 => 'eight', 9 => 'nine',
 			10 => 'ten', 11 => 'eleven', 12 => 'twelve',
 			13 => 'thirteen', 14 => 'fourteen', 15 => 'fifteen',
 			16 => 'sixteen', 17 => 'seventeen', 18 => 'eighteen',
 			19 => 'nineteen', 20 => 'twenty', 30 => 'thirty',
 			40 => 'forty', 50 => 'fifty', 60 => 'sixty',
 			70 => 'seventy', 80 => 'eighty', 90 => 'ninety');
 		$digits = array('', 'hundred','thousand','lakh', 'crore');
 		while( $i < $digits_length ) {
 			$divider = ($i == 2) ? 10 : 100;
 			$number = floor($no % $divider);
 			$no = floor($no / $divider);
 			$i += $divider == 10 ? 1 : 2;
 			if ($number) {
 				$plural = (($counter = count($str)) && $number > 9) ? 's' : null;
 				$hundred = ($counter == 1 && $str[0]) ? ' and ' : null;
 				$str [] = ($number < 21) ? $words[$number].' '. $digits[$counter]. $plural.' '.$hundred:$words[floor($number / 10) * 10].' '.$words[$number % 10]. ' '.$digits[$counter].$plural.' '.$hundred;
 			} else $str[] = null;
 		}
 		$Rupees = implode('', array_reverse($str));
 		$paise = ($decimal) ? "." . ($words[$decimal / 10] . " " . $words[$decimal % 10]) . ' Paise' : '';
 		return ($Rupees ? $Rupees . 'Rupees ' : '') . $paise;
 	}
 }

 ?>