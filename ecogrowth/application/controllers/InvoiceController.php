<?php 	

/*
 * 
 */
class InvoiceController extends Zend_Controller_Action
{

	public function init()
	{
		$this->_flashMessenger  = $this->_helper->getHelper('FlashMessenger');
		$this->initView();
		$this->dbAdapter    	= Zend_Db_Table::getDefaultAdapter(); 
		$auth              		= Zend_Auth::getInstance();
		$authStorage       		= $auth->getStorage();
		$this->id          		= $authStorage->read()->id;
		$this->role        		= $authStorage->read()->role;
		$this->role_type   		= $authStorage->read()->role_type;
		$this->access_token		= $authStorage->read()->access_token;
		$this->master_model = new Application_Model_Master();
		$this->invoice_model = new Application_Model_Invoice();
		$this->managePoSite_model = new Application_Model_ManagePoSite();
	}
	public function indexAction()
	{
		
	}
	// Function to show punched invoice list
	public function invoiceReportAction()
	{
		try {
			$this->checklogin();
			$this->view->messages = $messages = $this->_flashMessenger->getMessages();
			$this->view->role_type = $this->role_type;
			$invoiceReportQuery = $this->dbAdapter->select()
			->from('tbl_punched_invoice_details as tid', array('*'))
			->joinLeft('tbl_client_master as tcm','tcm.id = tid.client_id', array('client_name'))
			->joinLeft('tbl_states as ts','ts.id = tid.state_for_id', array('state_name'))
			->joinLeft('tbl_company_vendor_master as tcvm','tcvm.id = tid.company_vendor_id', array('vendor_company_name'))
			->where('tid.status = 1')
			->order('tid.invoice_date DESC');;
			$this->view->invoiceReports = $invoiceReportResult = $this->dbAdapter->fetchAll($invoiceReportQuery);
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
	} 
	public function exportInvoiceReportAction(){
		try{
			$this->checklogin();
			$this->view->messages = $messages = $this->_flashMessenger->getMessages();
			$this->view->role_type = $this->role_type;
			$invoiceReportQuery = $this->dbAdapter->select()
			->from('tbl_punched_invoice_details as tid', array('*'))
			->joinLeft('tbl_client_master as tcm','tcm.id = tid.client_id', array('client_name'))
			->joinLeft('tbl_states as ts','ts.id = tid.state_for_id', array('state_name'))
			->joinLeft('tbl_company_vendor_master as tcvm','tcvm.id = tid.company_vendor_id', array('vendor_company_name'))
			->where('tid.status = 1');
			$this->view->invoiceReports = $invoiceReportResult = $this->dbAdapter->fetchAll($invoiceReportQuery);
			$fileName = "InvoiceReport.xls"; 
         // echo'<pre>';
         // print_r($milkresult);
         // exit;
			$data = array(array('Sr. No.'=> "",'Client Name'=> "", 'PO Number'=> "",'Site ID'=> "",'State Name'=> "",'Invoice Number'=> "" ,'Invoice Date'=> "",'Invoice Amount'=> "",'Invoice Remark'=> "",'Vendor Name'=> "",'Vendor Invoice Date'=> "",'Vendor Invoice Number'=> "",'Vendor Invoice Amount'=> "",'Received Datet'=> "",'Received Amount'=> "",'Margin'=> ""));
			$i = 2; 
			foreach ($invoiceReportResult as $rs) {

				$row   = array();
				$row[] = stripslashes($i-1);
				$row[] = stripslashes($rs["client_name"]);
				$row[] = stripslashes($rs["po_no"]);
				$row[] = stripslashes($rs["site_id"]);
				$row[] = stripslashes($rs["state_name"]);
				$row[] = stripslashes($rs["invoice_no"]);
				$row[] =  date('d/m/Y', strtotime($rs['invoice_date']));
				$row[] = stripslashes($rs["invoice_value"]);
				$row[] = stripslashes($rs["invoice_remark"]);
				$row[] = stripslashes($rs["vendor_company_name"]);
				$row[] =  date('d/m/Y', strtotime($rs['company_vendor_invoice_date']));
				$row[] = stripslashes($rs["company_vendor_invoice_number"]);
				$row[] = stripslashes($rs["company_vendor_invoice_amount"]);
				$row[] =  date('d/m/Y', strtotime($rs['amount_received_date']));
				$row[] = stripslashes($rs["received_amount"]);
				$row[] = stripslashes($rs["margin"]);

				// print_r($row);
				// exit;

				$data[] = $row;
				$i++;
			}
			function filterData(&$str){
				$str = preg_replace("/\t/", "\\t", $str);
				$str = preg_replace("/\r?\n/", "\\n", $str);
				if(strstr($str, '"')) $str = '"' . str_replace('"', '""', $str) . '"';
			}

            //file name for download


            //headers for download
			header("Content-Disposition: attachment; filename=\"$fileName\"");
			header("Content-Type: application/vnd.ms-excel");

			$flag = false;
			foreach($data as $row) {
				if(!$flag) {
                    // display column names as first row
					echo implode("\t", array_keys($row)) . "\n";
					$flag = true;
				}
                // filter data
				array_walk($row, 'filterData');
				echo implode("\t", array_values($row)) . "\n";
			}
		}
		catch(Exception $e) {
			echo 'Message: ' .$e->getMessage();
			exit;
		}
		exit;
	}
	// Function to punch Invoice i.e. save invoice details
	public function punchInvoiceAction()
	{
		try {
			$this->checklogin();
			$clientListQuery = $this->dbAdapter->select()
			->from('tbl_client_master', array('id','client_name'))
			->where('is_active = 1');
			$this->view->clientList = $clientListResult = $this->dbAdapter->fetchAll($clientListQuery);
			$poNumbersQuery = $this->dbAdapter->select()
			->from('tbl_po_details', array('po_no as po_number'))
			->order('id desc');
			$this->view->poNumber = $poNumberResult = $this->dbAdapter->fetchAll($poNumbersQuery);
			$stateListQuery = $this->dbAdapter->select()
			->from('tbl_states', array('id','state_name'))
			->where('is_active = 1');
			$this->view->stateList = $stateListResult = $this->dbAdapter->fetchAll($stateListQuery);
			$getCompanyVendorListQuery = $this->dbAdapter->select()->from('tbl_company_vendor_master', array('*'))->where('is_active = 1');
			$this->view->companyVendorList = $getCompanyVendorListResult = $this->dbAdapter->fetchAll($getCompanyVendorListQuery);
			$params = $this->getRequest()->getParams();
			if ($this->getRequest()->isPost()) {
				if (empty($params['client_id']) || $params['client_id'] == "") {
					$params['error'] = "Client Name Missing. Please select client name.";
					$this->view->params = $params; 
				} else if (empty($params['state_id']) || $params['state_id'] == "") {
					$params['error'] = "State For Missing. Please select state for.";
					$this->view->params = $params;
				} else if (empty($params['invoice_date']) || $params['invoice_date'] == "") {
					$params['error'] = "Invoice Date Missing. Please select invoice date.";
					$this->view->params = $params;
				} else if (empty($params['invoice_amount']) || $params['invoice_amount'] == "") {
					$params['error'] = "Invoice Amount Missing. Please enter invoice amount.";
					$this->view->params = $params;
				} else if (empty($params['invoice_number']) || $params['invoice_number'] == "") {
					$params['error'] = "Invoice Number Missing. Please select invoice number.";
					$this->view->params = $params;
				} else {
					$insertData = array();
					if ($_FILES['invoice_doc']['error'] == 0) {
						if ($_FILES['invoice_doc']['name'] != "") {
							$targetDir = "uploads/invoice/";
							$targetFile = $targetDir.time().basename($_FILES['invoice_doc']['name']);
							$imageFileType = strtolower(pathinfo($targetFile,PATHINFO_EXTENSION));
							if ($imageFileType != "jpeg" && $imageFileType != "jpg" && $imageFileType != "png") {
								$params['error'] = "Upload Invoice Format is not JPG, JPEG or PNG. Please try again.";
								$this->view->params = $params;
							} else {
								$fileUploadStatus = move_uploaded_file($_FILES['invoice_doc']['tmp_name'], $targetFile);
								if ($fileUploadStatus) {
									$insertData['invoice_doc_path'] = "/".$targetFile;
								} else {
									$params['error'] = "File Uploading Failed. Please try again.";
									$this->view->params = $params;
								}
							}
						}
					}
					if ($_FILES['vendor_invoice_doc']['error'] == 0) {
						if ($_FILES['vendor_invoice_doc']['name'] != "") {
							$targetDir = "uploads/invoice/";
							$targetFile = $targetDir.time().basename($_FILES['vendor_invoice_doc']['name']);
							$imageFileType = strtolower(pathinfo($targetFile,PATHINFO_EXTENSION));
							if ($imageFileType != "jpeg" && $imageFileType != "jpg" && $imageFileType != "png") {
								$params['error'] = "Upload Invoice Format is not JPG, JPEG or PNG. Please try again.";
								$this->view->params = $params;
							} else {
								$fileUploadStatus = move_uploaded_file($_FILES['vendor_invoice_doc']['tmp_name'], $targetFile);
								if ($fileUploadStatus) {
									$insertData['invoice_doc_path'] = "/".$targetFile;
								} else {
									$params['error'] = "File Uploading Failed. Please try again.";
									$this->view->params = $params;
								}
							}
						}
					}
					$insertData['client_id']              = trim($params['client_id']);
					$insertData['state_for_id']           = trim($params['state_id']);
					$insertData['po_no']                  = trim($params['po_number']);
					$insertData['site_id']                = trim($params['site_id']);
					$insertData['invoice_date']           = $this->dateConverter(trim($params['invoice_date']));
					$insertData['invoice_value']          = trim($params['invoice_amount']);
					if ($params['received_amount_date']) {
						$insertData['amount_received_date']   = $this->dateConverter(trim($params['received_amount_date']));
					}
					if ($params['received_amount']) {
						$insertData['received_amount']        = trim($params['received_amount']);
					}
					$insertData['invoice_no']               = trim($params['invoice_number']);
					if ($params['remark']) {
						$insertData['invoice_remark']         = trim($params['remark']);
					}
					if ($params['company_vendor']) {
						$insertData['company_vendor_id']         	= trim($params['company_vendor']);
						$insertData['company_vendor_invoice_date']    = $this->dateConverter(trim($params['vendor_invoice_date']));
						$insertData['company_vendor_invoice_number']  = trim($params['vendor_invoice_number']);
						$insertData['company_vendor_invoice_amount']  = trim($params['vendor_invoice_amount']);
						$insertData['margin'] = $params['invoice_amount'] - $params['vendor_invoice_amount'];					
					}
					$insertData['created_by']             = $this->id;
					$insertData['created_at']             = date('Y-m-d H:i:s');
					$this->dbAdapter->insert('tbl_punched_invoice_details', $insertData);
					$this->_flashMessenger->addMessage(array('success'=>'Invoice Details have been saved successfully.'));
					$this->_redirect('/invoice/invoice-report');
				}
			}
		} catch(Exception $e){
			echo $e->getMEssage();
			exit;
		}
	}
/*
 * Function to attach payment advice to invoice
 */
public function attachPaymentAdviceToInvoiceAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if (empty($params['invoice_id']) || $params['invoice_id'] == "") {
				$response['flag'] = false;
				$response['title'] = "Invoice ID Missing!";
				$response['message'] = "Please try again after refreshing the page.";
			} else if (isset($_FILES['payAdviceAttachment']['error']) && $_FILES['payAdviceAttachment']['error'] != 0) {
				$response['flag'] = false;
				$response['title'] = "Attachment Missing!";
				$response['message'] = "Please select payment advice.";
			} else {
				$updateData = array();
				$targetDir = "uploads/invoice/payment_advice/";
				$targetFile = $targetDir.time().basename($_FILES['payAdviceAttachment']['name']);
				$imageFileType = strtolower(pathinfo($targetFile,PATHINFO_EXTENSION));
				if ($imageFileType != "jpeg" && $imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "pdf") {
					$response['flag'] = false;
					$response['title'] = "Invalid File Type!";
					$response['message'] = "Please select valid file type : jpeg, jpg, png or pdf.";
				} else {
					$fileUploadStatus = move_uploaded_file($_FILES['payAdviceAttachment']['tmp_name'], $targetFile);
					if ($fileUploadStatus) {
						$updateData['payment_advice_path'] = "/".$targetFile;
					} else {
						$response['flag'] = false;
						$response['title'] = "Upload Failed!";
						$response['message'] = "Please try again after refreshing the page.";
					}
				}
				$updateStatus = $this->dbAdapter->update('tbl_punched_invoice_details', $updateData, array("id = ?"=>$params['invoice_id']));
				if ($updateStatus) {
					$response['flag'] = true;
					$response['title'] = "Attached Successfully";
					$response['message'] = "Payment advice has been attached successfully.";
				} else {
					$response['flag'] = false;
					$response['title'] = "Upload Failed!";
					$response['message'] = "Please try again after refreshing the page.";
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
	// Function to change invoice status and update invoice i.e. update recieved amount and date
public function changeViewStatusAndUpdateInvoiceAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if (empty($params['invoice_id']) || $params['invoice_id'] == "") {
				$response['flag'] = false;
				$response['title'] = "Invoice ID Missing!";
				$response['message'] = "Please try again after refreshing the page.";
			} else if (empty($params['type']) || $params['type'] == "") {
				$response['flag'] = false;
				$response['title'] = "Status Type Missing!";
				$response['message'] = "Please try again after refreshing the page.";
			} else {
				$where = array();
				$updateData = array();
				$where['id = ?'] = $params['invoice_id'];
				if (isset($params['invoice_num'])) {
					$where['invoice_no = ?'] = $params['invoice_num']; 
				}
				if ($params['type'] == "mark") {
					$updateData['marked_for_review'] = "0";
				} else if ($params['type'] == "unmark") {
					$updateData['marked_for_review'] = "1";
				} else if ($params['type'] == "delete") {
					$updateData['status'] = "0";
				} else if ($params['type'] == "update") {
					$updateData['received_amount'] = trim($params['received_amount']);
					$updateData['amount_received_date'] = $this->dateConverter(trim($params['received_date']));
				}
				$updateData['updated_by'] = $this->id;
				$updateData['updated_at'] = date('Y-m-d H:i:s');
				$updatedStatus = $this->dbAdapter->update('tbl_punched_invoice_details', $updateData, $where);
				if ($updatedStatus) {
					if ($params['type'] == "update") {
						$response['flag'] = true;
						$response['title'] = "Invoice Updated Successfully";
						$response['message'] = "Invoice details has been updated successfully.";
					} else if ($params['type'] == "delete") {
						$response['flag'] = true;
						$response['title'] = "Invoice Deleted Successfully";
						$response['message'] = "Invoice details has been deleted successfully.";
					} else {  
						$response['flag'] = true;
						$response['title'] = "Status Changed Successfully";
						$response['message'] = "Invoice view status has been changed successfully.";
					}
				} else {
					$response['flag'] = false;
					$response['title'] = "Status Change Failed!";
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

	// Function to show list of services or products for invoice
public function servicesProductsForInvoiceAction()
{
	try {
		$this->checklogin();
		$getInvoiceServicesQuery = $this->dbAdapter->select()
		->from('tbl_invoice_services_master as tism', array('*'))
		->joinLeft('tbl_states as ts','ts.id = tism.state_id', array('state_name'))
		->joinLeft('tbl_client_master as tcm','tcm.id = tism.client_id', array('client_name'))
		->where('tism.is_deleted = 0');
		$this->view->invoiceServiceList = $getInvoiceServicesResult = $this->dbAdapter->fetchAll($getInvoiceServicesQuery);
		$this->view->stateList = $this->master_model->getStateNameMasterList();
	} catch(Exception $e) {
		echo $e->getMessage();
		exit;
	}
}

	// Function to add service or product for invoice
public function addInvoiceServiceProductAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if ($params['state_id'] == "" || empty($params['state_id'])) {
				$response['flag'] = false;
				$response['title'] = "State Missing!";
				$response['message'] = "Please select state name.";
			} else if (empty($params['client_id']) || $params['client_id'] == "") {
				$response['flag'] = false;
				$response['title'] = "Client Missing!";
				$response['message'] = "Please select client name.";
			} else if (empty($params['service_name']) || $params['service_name'] == "") {
				$response['flag'] = false;
				$response['title'] = "Service/Product Missing!";
				$response['message'] = "Please enter service/product name.";
			} else if (empty($params['hsn_sac_code']) || $params['hsn_sac_code'] == "") {
				$response['flag'] = false;
				$response['title'] = "HSN/SAC Code Missing!";
				$response['message'] = "Please enter HSN/SAC code.";
			} else if (empty($params['unit_of_measurement']) || $params['unit_of_measurement'] == "") {
				$response['flag'] = false;
				$response['title'] = "UOM Missing!";
				$response['message'] = "Please enter unit of measurement.";
			} else if (empty($params['gst_slab']) || $params['gst_slab'] == "") {
				$response['flag'] = false;
				$response['title'] = "GST Slab Missing!";
				$response['message'] = "Please enter GST slab for service.";
			} else {
				$insertData = array();
				$insertData['state_id'] 			= trim($params['state_id']);
				$insertData['client_id'] 			= trim($params['client_id']);
				$insertData['name_of_service'] 		= trim($params['service_name']);
				$insertData['hsn_sac_code'] 		= trim($params['hsn_sac_code']);
				$insertData['unit_of_measurement'] 	= trim($params['unit_of_measurement']);
				$insertData['gst_slab'] 			= trim($params['gst_slab']);
				$insertData['igst_percentage'] 		= trim($params['igst_percentage']);
				$insertData['cgst_percentage'] 		= trim($params['cgst_percentage']);
				$insertData['sgst_percentage'] 		= trim($params['sgst_percentage']);
				$insertData['service_rate'] 		= trim($params['service_price']);
				$insertData['created_by'] 			= $this->id;
				$insertData['created_at'] 			= date('Y-m-d H:i:s');
				$this->dbAdapter->insert('tbl_invoice_services_master', $insertData);
				$response['flag'] = true;
				$response['title'] = "Saved Successfully!";
				$response['message'] = "Service/Product has been saved successfully.";
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

	/*
     * Function to get Invoice Product/Service Details for editing
     * @params service_id
	 */
	public function getInvoiceServiceProductDetailsAction()
	{
		try {
			$this->checklogin();
			$response = array();
			$params = $this->getRequest()->getParams();
			if ($this->getRequest()->isPost()) {
				if (empty($params['service_id']) || $params['service_id'] == "") {
					$response['flag'] = false;
					$response['title'] = "Service ID Missing!";
					$response['message'] = 'Please try again after refreshing the page.';
				} else {
					$checkValidData = $this->invoice_model->getServiceProductDetailsByServiceId($params['service_id']);
					if ($checkValidData) {
						$response['flag'] = true;
						$response['serviceDetails'] = $checkValidData;
					} else {
						$response['flag'] = false;
						$response['title'] = "Invalid Service ID!";
						$response['message'] = 'Please try again after refreshing the page.';
					}
				}
			} else {
				$response['flag'] = false;
				$response['title'] = "Invalid Request Type!";
				$response['message'] = 'Please try again after refreshing the page.';
			}
		} catch(Exception $e) {
			$response['flag'] = false;
			$response['title'] = "Internal Server Error!";
			$response['message'] = $e->getMessage();
		}
		echo json_encode($response);
		exit;
	}

	/*
	 * Function to update the service/product data for invoice
	 */
	public function updateInvoiceProductServiceAction()
	{
		try {
			$this->checklogin();
			$response = array();
			$params = $this->getRequest()->getParams();
			if ($this->getRequest()->isPost()) {
				if (empty($params['nos']) || $params['nos'] == "") {
					$response['flag'] = false;
					$response['title'] = "Service/Product Missing!";
					$response['message'] = "Please enter service/product name.";
				} else if (empty($params['hsn']) || $params['hsn'] == "") {
					$response['flag'] = false;
					$response['title'] = "HSN/SAC Code Missing!";
					$response['message'] = "Please enter HSN/SAC code.";
				} else if (empty($params['uom']) || $params['uom'] == "") {
					$response['flag'] = false;
					$response['title'] = "UOM Missing!";
					$response['message'] = "Please enter unit of measurement.";
				} else if (empty($params['gst']) || $params['gst'] == "") {
					$response['flag'] = false;
					$response['title'] = "GST Slab Missing!";
					$response['message'] = "Please enter GST slab for service.";
				} else if (empty($params['igst']) || $params['igst'] == "") {
					$response['flag'] = false;
					$response['title'] = "IGST Missing!";
					$response['message'] = "Please enter IGST slab for service.";
				} else if (empty($params['cgst']) || $params['cgst'] == "") {
					$response['flag'] = false;
					$response['title'] = "CGST Missing!";
					$response['message'] = "Please enter CGST slab for service.";
				} else if (empty($params['sgst']) || $params['sgst'] == "") {
					$response['flag'] = false;
					$response['title'] = "SGST Missing!";
					$response['message'] = "Please enter SGST slab for service.";
				} else if (empty($params['rate']) || $params['rate'] == "") {
					$response['flag'] = false;
					$response['title'] = "Service Rate Missing!";
					$response['message'] = "Please enter rate for service.";
				} else {
					$updateData = array();
					$updateData['name_of_service'] 		= trim($params['nos']);
					$updateData['hsn_sac_code'] 		= trim($params['hsn']);
					$updateData['unit_of_measurement'] 	= trim($params['uom']);
					$updateData['gst_slab'] 			= trim($params['gst']);
					$updateData['igst_percentage'] 		= trim($params['igst']);
					$updateData['cgst_percentage'] 		= trim($params['cgst']);
					$updateData['sgst_percentage'] 		= trim($params['sgst']);
					$updateData['service_rate'] 		= trim($params['rate']);
					// $updateData['created_by'] 			= $this->id;
					// $updateData['created_at'] 			= date('Y-m-d H:i:s');
					$updateStatus = $this->dbAdapter->update('tbl_invoice_services_master', $updateData, array("id = ?"=>$params['service_id']));
					if ($updateStatus) {
						$response['flag'] = true;
						$response['title'] = "Updated Successfully";
						$response['message'] = "Service/Product has been updated successfully.";
						$response['serviceDetails'] = $params;
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

	// Function to deactivate, activate and delete service/product
	public function activateDeactivateDeleteServiceAction()
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
				} else if (empty($params['service_id']) || $params['service_id'] == "") {
					$response['flag'] = false;
					$response['title'] = "Invalid Request Type!";
					$response['message'] = "Please try again after refreshing the page.";
				} else {
					$where = array();
					$where['id = ?'] = $params['service_id'];
					if ($params['type'] == "deactivate") {
						$updateData['is_active'] = '0';
					} else if ($params['type'] == "activate") {
						$updateData['is_active'] = '1';
					} else if ($params['type'] == "delete") {
						$updateData['is_deleted'] = '1';
						$updateData['is_active'] = '0';
					}
					$updateData['updated_by'] = $this->id;
					$updateData['updated_at'] = date('Y-m-d H:i:s');
					$updateStatus = $this->dbAdapter->update('tbl_invoice_services_master', $updateData, $where);
					if ($updateStatus) {
						$response['flag'] = true;
						$response['title'] = ucwords(strtolower($params['type']))."d Successfully";
						$response['message'] = "Service/Product has been ".$params['type']."d successfully.";
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

// Function to generate new invoice
	public function generateInvoiceAction()
	{
		try {
			$this->checklogin();
			$this->view->stateList = $stateMasterList = $this->master_model->getStateNameMasterList();
			$this->view->serviceProductList = $serviceProductMasterList = $this->invoice_model->getInvoiceServicesProductsMasterList();
			$this->view->poList = $poList = $this->managePoSite_model->getPoDetails();
		} catch(Exception $e) {
			echo $e->getMessage();
			exit;
		}
	}

	// Function to print invoice and view of invoice
	public function generatedInvoiceViewAction()
	{
		try {
			$this->checklogin();
			$params = $this->getRequest()->getParams();
			if ($this->getRequest()->isPost()) {
				$year = date('y');
				$month = date('m');
				if ($month > '03') {
					$fy = $year."".$year+1;
				} else {
					$fy = ($year-1)."".$year;
				}
				$siteDetails = $this->managePoSite_model->getSiteDetailsBySiteId($params['site_id']);
				$params['poDate'] = date('d/m/Y', strtotime($siteDetails['order_date']));
				if ($siteDetails['so_no']) {
					$params['so_number'] = $siteDetails['so_no'];
				}
				if ($siteDetails['infratel_id']) {
					$params['infratel_id'] = $siteDetails['infratel_id'];
				}
				$stateData = $this->master_model->getStateNameByStateId($params['state_id']);
				$params['stateName'] = $stateData['state_name'];
				$params['stateCode'] = $stateData['state_code'];
				$params['invoiceNumber'] = "LTS/".$fy.'/';
				$productServiceDetailsArray = array();
				$total_taxable_value = 0;
				$total_igst_value = 0;
				$total_cgst_value = 0;
				$total_sgst_value = 0;
				$total_tax_amount = 0;
				$total_invoice_amount = 0;
				$taxAmountArray = array();
				foreach ($params['service_product_id'] as $key => $serviceProduct) {
					$serviceProductDetails = $this->invoice_model->getServiceProductDetailsByServiceId($serviceProduct);
					$taxAmountArray['serviceName'] = $serviceProductDetails['name_of_service'];
					$total_taxable_value = number_format(($total_taxable_value + $params['taxable_value'][$key]), 2, '.','');
					if ($params['isIgstApplicable'] == "Yes") {
						$taxAmountArray['igstRate'] = $serviceProductDetails['igst_percentage'];
						$taxAmountArray['cgstRate'] = $serviceProductDetails['cgst_percentage'];
						$taxAmountArray['sgstRate'] = $serviceProductDetails['sgst_percentage'];
						$taxAmountArray['igstAmount'] = number_format(($params['taxable_value'][$key] * $serviceProductDetails['igst_percentage'])/100,2,'.','');
						$total_igst_value = number_format(($total_igst_value + $taxAmountArray['igstAmount']), 2, '.',''); 
						$taxAmountArray['total'] = number_format(($params['taxable_value'][$key] + $taxAmountArray['igstAmount']), 2, '.','');
					} else {
						$taxAmountArray['igstRate'] = $serviceProductDetails['igst_percentage'];
						$taxAmountArray['cgstRate'] = $serviceProductDetails['cgst_percentage'];
						$taxAmountArray['sgstRate'] = $serviceProductDetails['sgst_percentage'];
						$taxAmountArray['cgstAmount'] = number_format((($params['taxable_value'][$key] * $serviceProductDetails['cgst_percentage'])/100), 2, '.','');
						$total_cgst_value = number_format(($total_cgst_value + $taxAmountArray['cgstAmount']), 2, '.',''); 
						$taxAmountArray['sgstAmount'] = number_format((($params['taxable_value'][$key] * $serviceProductDetails['sgst_percentage'])/100), 2, '.','');
						$total_sgst_value = number_format(($total_sgst_value + $taxAmountArray['sgstAmount']), 2, '.',''); 
						$taxAmountArray['total'] = number_format(($params['taxable_value'][$key] + $taxAmountArray['cgstAmount'] + $taxAmountArray['sgstAmount']), 2, '.','');
					}
					$total_invoice_amount = $total_invoice_amount + $taxAmountArray['total'];
					array_push($productServiceDetailsArray, $taxAmountArray);
				}
				$params['productDetails'] = $productServiceDetailsArray;
				$params['total_taxable_value'] = $total_taxable_value;
				$params['total_igst'] = $total_igst_value;
				$params['total_cgst'] = $total_cgst_value;
				$params['total_sgst'] = $total_sgst_value;
				if ($total_igst_value > '0') {
					$params['total_tax_amount'] = number_format($total_igst_value, 2, '.','');
				} else {
					$params['total_tax_amount'] = number_format(($total_cgst_value + $total_sgst_value),2,'.','');
				}
				$params['total_invoice_amount'] = number_format($total_invoice_amount, 2, '.','');
				$params['total_invoice_amount_in_words'] = $this->invoice_model->getIndianCurrency($params['total_invoice_amount']);
				$this->view->params = $params;
			}
		} catch(Exception $e) {
			echo $e->getMessage();
			exit;
		}
		$this->_helper->layout()->disableLayout();
	}
	
	// Function to generate invoices report
public function generatedInvoicesReportAction() 
{
    try {
        $this->checklogin();
        
        // Get request parameters
        $params = $this->getRequest()->getParams();
        
        // Load master data for the form/filters
        $this->view->stateList = $this->master_model->getStateNameMasterList();
        $this->view->serviceProductList = $this->invoice_model->getInvoiceServicesProductsMasterList();
        $this->view->poList = $this->managePoSite_model->getPoDetails();
        
        // Check if form is submitted (POST request)
        if ($this->getRequest()->isPost()) {
            
            // Calculate Financial Year
            $year = date('y');
            $month = date('m');
            if ($month > '03') {
                $fy = $year . "" . ($year + 1);
            } else {
                $fy = ($year - 1) . "" . $year;
            }
            
            // Get site details
            $siteDetails = $this->managePoSite_model->getSiteDetailsBySiteId($params['site_id']);
            
            // Set PO Date
            $params['poDate'] = date('d/m/Y', strtotime($siteDetails['order_date']));
            
            // Set optional fields if available
            if (isset($siteDetails['so_no']) && !empty($siteDetails['so_no'])) {
                $params['so_number'] = $siteDetails['so_no'];
            }
            
            if (isset($siteDetails['infratel_id']) && !empty($siteDetails['infratel_id'])) {
                $params['infratel_id'] = $siteDetails['infratel_id'];
            }
            
            // Get state data
            $stateData = $this->master_model->getStateNameByStateId($params['state_id']);
            $params['stateName'] = $stateData['state_name'];
            $params['stateCode'] = $stateData['state_code'];
            
            // Generate Invoice Number
            $params['invoiceNumber'] = "LTS/" . $fy . '/';
            
            // Initialize variables for calculations
            $productServiceDetailsArray = array();
            $total_taxable_value = 0;
            $total_igst_value = 0;
            $total_cgst_value = 0;
            $total_sgst_value = 0;
            $total_invoice_amount = 0;
            
            // Process each service/product
            foreach ($params['service_product_id'] as $key => $serviceProduct) {
                
                $serviceProductDetails = $this->invoice_model->getServiceProductDetailsByServiceId($serviceProduct);
                
                $taxAmountArray = array();
                $taxAmountArray['serviceName'] = $serviceProductDetails['name_of_service'];
                
                // Calculate total taxable value
                $total_taxable_value = number_format(
                    ($total_taxable_value + $params['taxable_value'][$key]), 
                    2, '.', ''
                );
                
                // Set tax rates
                $taxAmountArray['igstRate'] = $serviceProductDetails['igst_percentage'];
                $taxAmountArray['cgstRate'] = $serviceProductDetails['cgst_percentage'];
                $taxAmountArray['sgstRate'] = $serviceProductDetails['sgst_percentage'];
                
                // Calculate tax amounts based on IGST applicability
                if ($params['isIgstApplicable'] == "Yes") {
                    // IGST Calculation
                    $taxAmountArray['igstAmount'] = number_format(
                        ($params['taxable_value'][$key] * $serviceProductDetails['igst_percentage']) / 100,
                        2, '.', ''
                    );
                    
                    $total_igst_value = number_format(
                        ($total_igst_value + $taxAmountArray['igstAmount']), 
                        2, '.', ''
                    );
                    
                    $taxAmountArray['total'] = number_format(
                        ($params['taxable_value'][$key] + $taxAmountArray['igstAmount']), 
                        2, '.', ''
                    );
                } else {
                    // CGST and SGST Calculation
                    $taxAmountArray['cgstAmount'] = number_format(
                        (($params['taxable_value'][$key] * $serviceProductDetails['cgst_percentage']) / 100), 
                        2, '.', ''
                    );
                    
                    $total_cgst_value = number_format(
                        ($total_cgst_value + $taxAmountArray['cgstAmount']), 
                        2, '.', ''
                    );
                    
                    $taxAmountArray['sgstAmount'] = number_format(
                        (($params['taxable_value'][$key] * $serviceProductDetails['sgst_percentage']) / 100), 
                        2, '.', ''
                    );
                    
                    $total_sgst_value = number_format(
                        ($total_sgst_value + $taxAmountArray['sgstAmount']), 
                        2, '.', ''
                    );
                    
                    $taxAmountArray['total'] = number_format(
                        ($params['taxable_value'][$key] + $taxAmountArray['cgstAmount'] + $taxAmountArray['sgstAmount']), 
                        2, '.', ''
                    );
                }
                
                // Add to total invoice amount
                $total_invoice_amount = $total_invoice_amount + $taxAmountArray['total'];
                
                // Add to product details array
                array_push($productServiceDetailsArray, $taxAmountArray);
            }
            
            // Set calculated values to params
            $params['productDetails'] = $productServiceDetailsArray;
            $params['total_taxable_value'] = $total_taxable_value;
            $params['total_igst'] = $total_igst_value;
            $params['total_cgst'] = $total_cgst_value;
            $params['total_sgst'] = $total_sgst_value;
            
            // Calculate total tax amount
            if ($total_igst_value > '0') {
                $params['total_tax_amount'] = number_format($total_igst_value, 2, '.', '');
            } else {
                $params['total_tax_amount'] = number_format(
                    ($total_cgst_value + $total_sgst_value), 
                    2, '.', ''
                );
            }
            
            // Set total invoice amount
            $params['total_invoice_amount'] = number_format($total_invoice_amount, 2, '.', '');
            
            // Convert amount to words
            $params['total_invoice_amount_in_words'] = $this->invoice_model->getIndianCurrency(
                $params['total_invoice_amount']
            );
            
            // Pass params to view
            $this->view->params = $params;
            
            // Render the invoice report view
            // You can choose to disable layout if you want a clean print view
            // $this->_helper->layout()->disableLayout();
        }
        
    } catch(Exception $e) {
        echo $e->getMessage();
        exit;
    }
}

	// Function to get service/product details 
	public function getServiceProductDetailsAction()
	{
		try {
			$response = array();
			$params = $this->getRequest()->getParams();
			if ($this->getRequest()->isPost()) {
				if (empty($params['service_product_id']) || $params['service_product_id'] == "") {
					$response['flag'] = false;
					$response['title'] = "Service/Product Missing!";
					$response['message'] = "Please select service/product.";
				} else {
					$serviceProductDetails = $this->invoice_model->getServiceProductDetailsByServiceId($params['service_product_id']);
					if (!$serviceProductDetails || empty($serviceProductDetails)) {
						$response['flag'] = false;
						$response['title'] = "Data Not Found!";
						$response['message'] = "Please update data or select valid service/product.";
					} else {
						$response['flag'] = true;
						$response['serviceProduceDetail'] = $serviceProductDetails;
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
	// Function to convert date into SQL Format date
	function dateConverter($var){
		$date = explode('/', $var);
		$final_date = $date['2'].'-'.$date['1'].'-'.$date['0'];
		return $final_date;
	}

	// Function to check whether the user has logged in or not or session has been timed out
	public function checklogin(){   
		$auth           = Zend_Auth::getInstance(); 
		$errorMessage   = ""; 
		if(!$auth->hasIdentity()){
			$this->_redirect('/admin/index');  
		}   
	} 

public function monthlyInvoiceAction()
{
    try {
        $this->checklogin();

        $this->view->messages = $this->_flashMessenger->getMessages();
        $this->view->params   = $params = $this->getRequest()->getParams();

        /* ================= FILTER (OPTIONAL) ================= */
        $month = !empty($params['month']) ? (int)$params['month'] : null;
        $year  = !empty($params['year'])  ? (int)$params['year']  : null;

        $this->view->month = $month;
        $this->view->year  = $year;

        /* ================= TOTAL SUMMARY ================= */
        $totalSql = "
            SELECT
                IFNULL(SUM(po_amount),0) AS po_amount,
                IFNULL(SUM(lts_invoice_amount),0) AS lts_invoice_amount,
                IFNULL(SUM(invoice_value),0) AS invoice_amount
            FROM monthly_invoice_details
            WHERE is_deleted = 0
        ";

        $totalParams = [];

        if ($month && $year) {
            $totalSql .= " AND month = ? AND year = ? ";
            $totalParams[] = $month;
            $totalParams[] = $year;
        }

        $this->view->total_amount = $this->dbAdapter->fetchRow(
            $totalSql,
            $totalParams
        );

        /* ================= SITE EXPENSE (OPTIMIZED) ================= */
        $expenseSql = "
            SELECT
                tpid.client_id,
                tpid.state_for_id AS state_id,
                SUM(REPLACE(tse.amount, ',', '')) AS total
            FROM tbl_site_expense tse
            JOIN tbl_punched_invoice_details tpid
                ON tpid.po_no = tse.po_no
            WHERE tse.status = 1
        ";

        $expenseParams = [];

        if ($month && $year) {
            $startDate = $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT) . '-01';
            $endDate   = date('Y-m-t', strtotime($startDate));

            $expenseSql .= " AND tse.transfer_date BETWEEN ? AND ? ";
            $expenseParams[] = $startDate;
            $expenseParams[] = $endDate;
        }

        $expenseSql .= "
            GROUP BY
                tpid.client_id,
                tpid.state_for_id
        ";

        $expenseRows = $this->dbAdapter->fetchAll(
            $expenseSql,
            $expenseParams
        );

        /* ================= INDEX EXPENSE DATA ================= */
        $expenseIndex = [];
        foreach ($expenseRows as $row) {
            $expenseIndex[$row['client_id'] . '_' . $row['state_id']] = $row['total'];
        }

        /* ================= MONTHLY REPORT ================= */
       $reportSql = "
            SELECT
                mid.*,
                ts.state_name,
                tcm.client_name
            FROM monthly_invoice_details mid
            LEFT JOIN tbl_states ts ON ts.id = mid.state_id
            LEFT JOIN tbl_client_master tcm ON tcm.id = mid.client_id
            WHERE mid.is_deleted = 0
        ";
        
        $reportParams = [];
        
        if ($month && $year) {
            $reportSql .= " AND mid.month = ? AND mid.year = ? ";
            $reportParams[] = $month;
            $reportParams[] = $year;
        }
        
        /* ORDER BY ALWAYS LAST */
        $reportSql .= "
            ORDER BY
                mid.year DESC,
                mid.month DESC,
                mid.id DESC
        ";
        
        $monthly_report = $this->dbAdapter->fetchAll(
            $reportSql,
            $reportParams
        );

        $monthly_report = $this->dbAdapter->fetchAll(
            $reportSql,
            $reportParams
        );

        /* ================= MERGE DATA ================= */
        foreach ($monthly_report as $key => $row) {

            // Vendor JSON decode
            if (!empty($row['vendor_data'])) {
                $monthly_report[$key]['vendor_details'] =
                    json_decode($row['vendor_data'], true);
            }

            // Attach expense
            $indexKey = $row['client_id'] . '_' . $row['state_id'];
            $monthly_report[$key]['total'] = $expenseIndex[$indexKey] ?? 0;
        }

        $this->view->monthly_report = $monthly_report;

    } catch (Exception $e) {
        echo 'Message: ' . $e->getMessage();
        exit;
    }
}




	public function addMonthlyInvoiceAction()
	{
	    
		try{
			$this->checklogin();
			$this->view->messages = $messages = $this->_flashMessenger->getMessages();
			$this->view->params = $params = $this->getRequest()->getParams();
			$clientListQuery = $this->dbAdapter->select()
			->from('tbl_client_master', array('id','client_name'))
			->where('is_active = 1');
			$this->view->clientList = $clientListResult = $this->dbAdapter->fetchAll($clientListQuery);
			$stateListQuery = $this->dbAdapter->select()
			->from('tbl_states', array('id','state_name'))
			->where('is_active = 1');
			$this->view->stateList = $stateListResult = $this->dbAdapter->fetchAll($stateListQuery);
			$VendorListQuery = $this->dbAdapter->select()
			->from('tbl_vendor', array('id','vendor_name','contact_person'))
			->where('is_active = 1');
			$this->view->vendorList = $stateListResult = $this->dbAdapter->fetchAll($VendorListQuery);

			if($this->getRequest()->isPost()){
				$insertData=array();
				$data=array();
				if(!empty($params)){
					$insertData['state_id']=$params['state_id'];
					$insertData['client_id']=$params['client_id'];
					$insertData['po_amount']=$params['po_value'];
					$insertData['invoice_value']=$params['invoice_amount'];
					$insertData['month']=$params['month'];
					$insertData['year']=$params['year'];
					$insertData['lts_invoice_percent']=$params['lts_invoice_percent'];
					$insertData['profit']=$params['profit'];
					$insertData['lts_invoice_amount']=$params['lts_invoice_amount'];
					foreach ($params['vendor_id'] as $key => $value) {
						$data[$key]['vendor_amount']=$params['vendor_amount'][$key];
						$name =$this->dbAdapter->fetchRow('Select vendor_name from tbl_vendor where id ='.$value);
						$data[$key]['vendor_name']=$name['vendor_name'];
						$data[$key]['vendor_id']=$value;

					}
					$insertData['vendor_data'] = json_encode($data);
					// echo '<pre>';print_r($insertData);exit;

					$this->dbAdapter->insert('monthly_invoice_details',$insertData);

					$this->_redirect('/invoice/monthly-invoice');

				}
			}
			$layout = $this->_helper->layout();
			$layout->disableLayout('');
		}catch(Exception $e){
			echo 'Message: ' .$e->getMessage();
			exit;
		}
	}

	public function deleteInvoiceAction(){
		try{
			$this->checklogin();
			$response = array();
			$this->view->messages = $messages = $this->_flashMessenger->getMessages();
			$this->view->params = $params = $this->getRequest()->getParams();
			if($this->getRequest()->isPost()){
				if(!empty($params['id'])){
					$query ="Update monthly_invoice_details set is_deleted = 1 where id = ".$params['id'];
					$this->dbAdapter->query($query);
					$response['flag'] = true;
					$response['title'] = "Deactivated Successfully";
					$response['message'] = "System has been deactivated successfully.";
				}
			}else{
				$response['flag'] = false;
				$response['message'] = "Invalid Request Type. Please try again later.";
			}
			$layout = $this->_helper->layout();
			$layout->disableLayout('');
		}catch(Exception $e){
			$response['flag'] = false;
			$response['message'] = $e->getMessage();
			exit;
		}
		echo json_encode($response);
		exit;
	}

	public function getStateAction(){
		try {
			$response = array();
			$params = $this->getRequest()->getParams();
			if (!empty($params)) {
				$stateListQuery ="Select * from tbl_states where is_active =1";
				$userListResult = $this->dbAdapter->fetchAll($stateListQuery);
				$userOptions = '<option value="">Please Select</option>';
				foreach ($userListResult as $user) {
					$userOptions .= '<option value="'.$user['id'].'">'.ucwords(strtolower($user['state_name'])).'</option>';
				}
				$response['flag']=true;
				$response['userOption'] = $userOptions;
			}
		} catch(Exception $e){
			$response['flag'] = false;
			$response['title'] = "Internal Error!";
			$response['message'] = $e->getMessage();
		}
		echo json_encode($response);
		exit;
	}

	public function getClientAction(){
		try {
			$response = array();
			$params = $this->getRequest()->getParams();
			if (!empty($params)) {
				$stateListQuery = $this->dbAdapter->select()
				->from("tbl_client_master", array("id","client_name"))
				->where("is_active = 1")
				->order("client_name asc");
				$userListResult = $this->dbAdapter->fetchAll($stateListQuery);
				$userOptions = '<option value="">Please Select</option>';
				foreach ($userListResult as $user) {
					$userOptions .= '<option value="'.$user['id'].'">'.ucwords(strtolower($user['client_name'])).'</option>';
				}
				$response['flag']=true;
				$response['option'] = $userOptions;
			}
		} catch(Exception $e){
			$response['flag'] = false;
			$response['title'] = "Internal Error!";
			$response['message'] = $e->getMessage();
		}
		echo json_encode($response);
		exit;
	}

	public function getVendorsAction(){
		try {
			$response = array();
			$params = $this->getRequest()->getParams();
			if (!empty($params)) {
				$stateListQuery = $this->dbAdapter->select()
				->from("tbl_vendor", array("id","vendor_name"))
				->where("is_active = 1")
				->order("vendor_name asc");
				$userListResult = $this->dbAdapter->fetchAll($stateListQuery);
				$userOptions = '<option value="">Select Vendor</option>';
				foreach ($userListResult as $user) {
					$userOptions .= '<option value="'.$user['id'].'">'.ucwords(strtolower($user['vendor_name'])).'</option>';
				}
				$response['flag']=true;
				$response['vendor'] = $userOptions;
			}
		} catch(Exception $e){
			$response['flag'] = false;
			$response['title'] = "Internal Error!";
			$response['message'] = $e->getMessage();
		}
		echo json_encode($response);
		exit;
	}

	public function getYearsAction(){
		try {
			$response = array();
			$params = $this->getRequest()->getParams();
			if (!empty($params)) {
				$years = array_combine(range(date("Y"), 1910), range(date("Y"), 1910));
				foreach($years as $year) {
					$options .= '<option value="'.$year.'">'.$year.'</option>';
				}
				$response['flag']=true;
				$response['option'] = $options;
			}
		} catch(Exception $e){
			$response['flag'] = false;
			$response['title'] = "Internal Error!";
			$response['message'] = $e->getMessage();
		}
		echo json_encode($response);
		exit;
	}

	public function viewMonthlyInvoiceAction(){
		try {
			$response = array();
			$params = $this->getRequest()->getParams();
			if (!empty($params)) {
				$stateListQuery = $this->dbAdapter->select()
				->from("monthly_invoice_details", array("vendor_data",))->where('id = ?',$params['id']);
				$userListResult = $this->dbAdapter->fetchRow($stateListQuery);
				$list = json_decode($userListResult['vendor_data'],true);
				$data =array();
				$sum =0;
				foreach ($list as $key => $value) {
					$vendor =$this->dbAdapter->fetchRow("Select vendor_name from tbl_vendor where id = ".$value['vendor_id']);
					$data[$key]['vendor_name'] = $vendor['vendor_name'];
					$data[$key]['vendor_amount'] = $value['vendor_amount'];
					$sum +=  $value['vendor_amount'];
				}
				// echo "<pre>";print_r($data);exit;
				$this->view->vendor_list =$data;
				$this->view->total =$sum;
				$this->_helper->layout()->disableLayout();

			}
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
		
	}
}

?>