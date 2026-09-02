<?php 
/* Including PHPExcel IOFactory library to read excel file */
set_include_path(get_include_path() . PATH_SEPARATOR . 'PHPExcelReader/Classes/');
include 'PHPExcel/IOFactory.php';
/*
 * 
 */
class ManagePoSiteController extends Zend_Controller_Action
{
	
	public function init() {
		/* Initialize action controller here */
		$this->_flashMessenger  = $this->_helper->getHelper('FlashMessenger');
		$this->initView();
		$bootstrap              = $this->getInvokeArg('bootstrap');
		$aConfig                = $bootstrap->getOptions();
		$this->dbAdapter        = Zend_Db_Table::getDefaultAdapter(); 
		$auth                   = Zend_Auth::getInstance();
		$authStorage            = $auth->getStorage();
		$this->id               = $authStorage->read()->id;
		$this->role             = $authStorage->read()->role;
		$this->role_type        = $authStorage->read()->role_type;
		$this->access_token     = $authStorage->read()->access_token;
		$this->master_model 	= new Application_Model_Master();
		$this->manage_po_site_model 	= new Application_Model_ManagePoSite();
	}
	public function deleteSitesAction()
	{
		try{
			$this->view->params = $params = $this->getRequest()->getParams();
			$query ="Select site_id from tbl_expense where site_id =SO".$params['site_id'];
//			echo '<pre>';print_r($query);exit;

			$result =$this->dbAdapter->fetchRow($query);

			if(!$result){
				$delete_query = "Delete from tbl_po_sites  tps INNER JOIN tbl_deployment td ON tps.site_id = td.site_id 
				where id =".$params['id'];
				$delete = $this->dbAdapter->query($delete_query);
				$this->_redirect('/holiday/index');
			}
			$layout = $this->_helper->layout();
			$layout->disableLayout('');
		}catch(Exception $e){
			echo $e->getMessage();exit;
		}
	}
	public function importPoAction()
	{
		try {
			$this->checklogin(); 
			$params = $this->getRequest()->getParams();
			$this->view->messages  = $this->_flashMessenger->getMessages(); 
			if(isset($_FILES['uploaded_excel']['error'])){      
				if($_FILES['uploaded_excel']['error'] > 0){
					$params['error'] = "File Missing! Please select file to import data.";
					$this->view->params = $params;
				}else{
					$allowed = array("xls" => "application/vnd.ms-excel", 
						"xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); 
					$filename = $_FILES["uploaded_excel"]["name"];
					$filetype = $_FILES["uploaded_excel"]["type"];
					$filesize = $_FILES["uploaded_excel"]["size"]; 
					$ext = pathinfo($filename, PATHINFO_EXTENSION);
					if(!array_key_exists($ext, $allowed)){
						$params['error'] = "Different File Type! Please select a valid file to import data.";
						$this->view->params = $params;
					}  
					if(in_array($filetype, $allowed)){        
						move_uploaded_file($_FILES["uploaded_excel"]["tmp_name"], "PHPExcelReader/" . $_FILES["uploaded_excel"]["name"]);
            $inputFileName = 'PHPExcelReader/'.$filename;  // File to read
            $query = $this->dbAdapter->select() ->from('INFORMATION_SCHEMA.COLUMNS',array('COLUMN_NAME'))->where('TABLE_NAME =?','tbl_expense_report');
            $res = $this->dbAdapter->fetchAll($query);             
            try {
            	$objPHPExcel = PHPExcel_IOFactory::load($inputFileName);
            } catch(Exception $e) {
            	die('Error loading file "'.pathinfo($inputFileName,PATHINFO_BASENAME).'": '.$e->getMessage());
            }
            $sheetData = $objPHPExcel->getActiveSheet()->toArray(null,true,true,true); 
            $i=1;
            foreach($sheetData as $rec) {
            	if($i!=1){ 
            		if(trim($rec['A']) != ""){
            			$masterDataArray = array();
            			$masterDataArray['po_no']                   = trim($rec['A']);
            			$masterDataArray['rev']                     = trim($rec['B']);
            			$masterDataArray['operating_unit']          = trim($rec['C']);
            			$masterDataArray['document_type']           = trim($rec['D']);
            			$masterDataArray['description']             = trim($rec['E']);
            			$masterDataArray['order_date']              = date('Y-m-d H:i', strtotime(trim($rec['F'])));
            			$masterDataArray['buyer']                   = trim($rec['G']);
            			$masterDataArray['currency']                = trim($rec['H']);
            			$masterDataArray['amount']                  = trim($rec['I']);
            			$masterDataArray['inclusive_tax']           = trim($rec['J']);
            			$masterDataArray['exclusive_tax']           = trim($rec['K']);
            			$masterDataArray['tax_amount']              = trim($rec['L']);
            			$masterDataArray['status']                  = trim($rec['M']);
            			$this->dbAdapter->insert('tbl_po_details', $masterDataArray);
            			$split_array = explode('-',$rec['E']);
            			for( $l=0; $l<sizeof($split_array); $l++ ){
            				if( $l != '0' ){
            					$siteArray['po_no']   = trim($rec['A']);
            					$siteArray['order_date']   = date('Y-m-d H:i', strtotime(trim($rec['F'])));
            					$siteArray['site_id']   = $split_array[$l];
            					$this->dbAdapter->insert('tbl_po_sites', $siteArray);
            				}
            			}
            		}
            	}
            	$i++;
            }
            if($i > 1) {
            	$this->_flashMessenger->addMessage(array('success'=>'PO has been imported successfully.'));
            	$this->_redirect('/manage-po-site/po-details');  
            }                         
        }   /* end of in array */    
    } /* end of else */
}
} catch(Exception $e){
	echo $e->getMessage();
	exit;
}
}
public function poDetailsAction()
{
	try {
	    
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		// echo '<pre>';print_r($this->id);exit;
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
		 $poDetailsQuery = $this->dbAdapter->select()
		->from('tbl_po_details', array('id','po_no','rev','operating_unit','document_type','order_date','po_amount','exclusive_tax','tax_amount','status','po_completion_status','site_type'))
		->where('status=?',0)
		->where('is_deleted=?',0)
		->where("order_date >= ?",  $params['from_date'])
    	->where("order_date <= ?",  $params['to_date'])
		->order('id desc');
		}else{
		$poDetailsQuery = $this->dbAdapter->select()
		->from('tbl_po_details', array('id','po_no','rev','operating_unit','document_type','order_date','po_amount','exclusive_tax','tax_amount','status','po_completion_status','site_type'))
		->where('status=?',0)
		->where('is_deleted=?',0)
		->order('id desc');
		}
		$this->view->poDetailsList = $poDetailsResult = $this->dbAdapter->fetchAll($poDetailsQuery);
	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}
public function getSiteListByPoNumberAction()
{
	try {
		$this->checklogin();
		$this->view->params = $params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			$siteListQuery = $this->dbAdapter->select()
			->from('tbl_po_sites', array('*'))
			->where('is_deleted = ?', 0)
			->where('po_no = ?', $params['po_number']);
			$siteListResult = $this->dbAdapter->fetchAll($siteListQuery);
			if ($siteListResult) {
				$siteDetailsArray = array();
				foreach ($siteListResult as $site) {
					$siteExpenseQuery = $this->dbAdapter->select()
					->from('tbl_site_expense', array('sum(amount) as total_expense'))
					->where('po_no = ?', $params['po_number'])
					->where('site_id = ?', $site['site_id']);
					$siteExpenseAndStatusResult = $this->dbAdapter->fetchRow($siteExpenseQuery);
					$site['total_site_expense'] = $siteExpenseAndStatusResult['total_expense'];
					$siteAllocationAndStatusQuery = $this->dbAdapter->select()
					->from('tbl_site_allocation', array('id','status','due_date','created_at'))
					->where('site_id = ?', $site['site_id'])
					// ->where('is_deleted = ?', 0)
					->where('po_no = ?', $params['po_number']);
					$siteAllocationAndStatusResult = $this->dbAdapter->fetchRow($siteAllocationAndStatusQuery);
					$site['site_allocation_id'] = $siteAllocationAndStatusResult['id'];
					$site['site_status'] 		= $siteAllocationAndStatusResult['status'];
					$site['site_due_date'] 		= $siteAllocationAndStatusResult['due_date'];
					$site['site_allocation_date'] = $siteAllocationAndStatusResult['created_at'];
					array_push($siteDetailsArray, $site);
				}
				$this->view->poSiteDetails = $siteDetailsArray;
			}
		}

	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
	$this->_helper->layout()->disableLayout();
}
public function poStatusAction()
{
	try {

	} catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
}

/*-----------------METHOD-START :  EXPORT PO DETAILS  --------------*/
public function exportPoDetailsAction(){
	try{
		$this->checklogin(); 
		$params = $this->getRequest()->getParams(); 
		$messages     = $this->_flashMessenger->getMessages(); 
// 		print_r($params);
// 		exit();
		$sum_amount = 0;
		if($this->role_type != 1 && $this->role_type != 4){
			$this->_redirect('/authlogout/logout');
		}
		
		if(empty($params['export_from_date']) || $params['export_from_date'] == "" || empty($params['export_to_date']) || $params['export_to_date'] == ""){
    		$poDetailsQuery = $this->dbAdapter->select()
    		->from('tbl_po_details as tod', array('id','po_no','rev','operating_unit','document_type','order_date','po_amount','exclusive_tax','tax_amount','status','po_completion_status','site_type'))		
    		->join('tbl_deployment as td', 'td.state_id = tod.state_id and td.client_id = tod.client_id and td.po = tod.po_no', array('work_type','infratel_id'))
    		->join('tbl_client_master as tcm', 'tcm.id = tod.client_id and tcm.state_id = tod.state_id', array('client_name'))
    		->join('tbl_states as ts', 'ts.id = tod.state_id', array('state_name'))
    		->where('tod.status=?',0)
    		->where('tod.is_deleted=?',0)
    		->where("tod.order_date >= ?",  '2023-04-01')
    		->where("tod.order_date <= ?",  '2024-03-31')
    		->order('tod.id desc');
			}else{
    		$poDetailsQuery = $this->dbAdapter->select()
    		->from('tbl_po_details as tod', array('id','po_no','rev','operating_unit','document_type','order_date','po_amount','exclusive_tax','tax_amount','status','po_completion_status','site_type'))		
    		->join('tbl_deployment as td', 'td.state_id = tod.state_id and td.client_id = tod.client_id and td.po = tod.po_no', array('work_type','infratel_id'))
    		->join('tbl_client_master as tcm', 'tcm.id = tod.client_id and tcm.state_id = tod.state_id', array('client_name'))
    		->join('tbl_states as ts', 'ts.id = tod.state_id', array('state_name'))
    		->where('tod.status=?',0)
    		->where('tod.is_deleted=?',0)
    		->where("tod.order_date >= ?",  $params['export_from_date'])
    		->where("tod.order_date <= ?",  $params['export_to_date'])
    		->order('tod.id desc');
			}
// 		echo $poDetailsQuery;
// 		exit;
		$poDetailsResult = $this->dbAdapter->fetchAll($poDetailsQuery);		

		$fileName = "PoDetails.xls"; 

		$data = array(array('Sr. No.'=> "",'State Name'=>"",'Client Name'=>"",'PO No'=> "", 'PO Order Date'=> "",'Revision'=> "",'Work Type'=> "",'Amount'=> "",'Exclusive Tax'=> "" ,'Total Tax'=> "",'Status'=> "",'PO Completion Status'=>"",'Site Type'=>"",'Infratel Id'=>""));
		$i = 2; 
		foreach ($poDetailsResult as $poDetail) {
			// print_r($poDetail);
			// exit;

			$row   = array();
			$row[] = stripslashes($i-1);
			$row[] = stripslashes($poDetail["state_name"]);
			$row[] = stripslashes($poDetail["client_name"]);
			$row[] = stripslashes($poDetail["po_no"]);
			$row[] =  date('d/m/Y', strtotime($poDetail['order_date']));
			$row[] = stripslashes($poDetail["rev"]);
			// $row[] = stripslashes($poDetail["site_id"]);
			// $row[] = stripslashes($poDetail["site_name"]);
			$row[] = stripslashes($poDetail["work_type"]);
			$row[] = stripslashes($poDetail["po_amount"]);
			$row[] = stripslashes($poDetail["exclusive_tax"]);
			$row[] = stripslashes($poDetail["tax_amount"]);
			$row[] = stripslashes($poDetail["status"]);
			$row[] = stripslashes($poDetail["po_completion_status"]);
			$row[] = stripslashes($poDetail["site_type"]);
			$row[] = stripslashes($poDetail["infratel_id"]);

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


public function importSiteDataAction()
{
	try {
		$this->checklogin();
		$this->view->messages = $messages = $this->_flashMessenger->getMessages();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			$duplicate_data_count = 0;
			if (isset($params['type_of_sheet']) && empty($params['type_of_sheet'])) {
				$params['error'] = "Sheet Type Missing! Please select type of sheet.";
				$this->view->params = $params;
			} else {
				if (isset($_FILES['uploaded_excel']) && ($_FILES['uploaded_excel']['name'] == "" || $_FILES['uploaded_excel']['name'] == NULL)) {
					$params['error'] = "Sheet is Missing! Please select proper file to import data.";
					$this->view->params = $params;
				} else {
					$allowed = array("xls" => "application/vnd.ms-excel", "xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
					$fileName = $_FILES['uploaded_excel']['name'];
					$fileType = $_FILES['uploaded_excel']['type'];
					$fileSize = $_FILES['uploaded_excel']['size'];
					$fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
					if (!array_key_exists($fileExtension, $allowed)) {
						$params['error'] = "Invalid File Type! Please select a proper excel file.";
						$this->view->params = $params;
					} else {
						if (in_array($fileType, $allowed)) {
							move_uploaded_file($_FILES["uploaded_excel"]["tmp_name"], "PHPExcelReader/" . $_FILES["uploaded_excel"]["name"]);
								$movedFileName = 'PHPExcelReader/'.$fileName;// File to read
								try {
									$objPHPExcel = PHPExcel_IOFactory::load($movedFileName);
								} catch(Exception $e) {
									die('Error loading file "'.pathinfo($movedFileName,PATHINFO_BASENAME).'": '.$e->getMessage());
								}
								$sheetData = $objPHPExcel->getActiveSheet()->toArray(null,true,true,true);
								if ($params['type_of_sheet'] == "Deployment") {
									if ($sheetData[1]['C'] != "PO DATE" || $sheetData[1]['D'] != "PO NO" || $sheetData[1]['E'] != "SO. NO" || $sheetData[1]['F'] != "SITE ID" || $sheetData[1]['G'] != "ZDM" || $sheetData[1]['H'] != "INFRATEL ID" || $sheetData[1]['I'] != "LOCATION" || $sheetData[1]['J'] != "WORK TYPE") {
										$params['error'] = "Invalid Deployment Sheet Format! Please import a valid format deployment sheet.";
										$this->view->params = $params;
									} else {
										$i = 1;
										foreach ($sheetData as $record) {
											if ($i != 1) {
												if ($record['D'] != "") {
													$checkDuplicateDataQuery = $this->dbAdapter->select()
													->from('tbl_deployment', array('*'))
													->where('po = ?', trim($record['D']))
													->where('site_id = ?', trim($record['F']))
													->where('infratel_id = ?', trim($record['H']))
													->where('location = ?', trim($record['I']))
													->where('work_type = ?', trim($record['J']));
													$checkDuplicateDataResult = $this->dbAdapter->fetchRow($checkDuplicateDataQuery);
													if ($checkDuplicateDataResult) {
														$duplicate_data_count += 1;
													} else {
														$insertData = array();
														$insertData['po_date'] = date('Y-m-d', strtotime($record['C']));
														$insertData['po'] 	= trim($record['D']);
														$insertData['so_no'] = trim($record['E']);
														$insertData['site_id'] = trim($record['F']);
														$insertData['infratel_id'] = trim($record['H']);
														$insertData['location'] = trim($record['I']);
														$insertData['work_type'] = trim($record['J']);
														$insertData['importation_datetime'] = date('Y-m-d');
														$this->dbAdapter->insert('tbl_deployment', $insertData);
													}
												}
											}
											$i++;
										}
									}
									if ($duplicate_data_count > 0) {
										$this->_flashMessenger->addMessage(array('success'=>'Deployment data has been imported successfully but found '.$duplicate_data_count.' duplicate data.'));
										$this->_redirect('/manage-po-site/import-site-data');
									} else {
										$this->_flashMessenger->addMessage(array('success'=>'Deployment data has been imported successfully.'));
										$this->_redirect('/manage-po-site/import-site-data');
									}
								} else if ($params['type_of_sheet'] == 'Matrix') {
									if ($sheetData[1]['A']!="Tenant Id"||$sheetData[1]['B']!="Infratel Site ID"||$sheetData[1]['C']!="ZONE"||$sheetData[1]['D']!="ZDM"||$sheetData[1]['E']!="Contact"||$sheetData[1]['F']!="Cluster"||$sheetData[1]['G']!="Cluster Incharge"||$sheetData[1]['H']!="CI Mobile"||$sheetData[1]['J']!="ZOM"||$sheetData[1]['K']!="ZOM Mobile"||$sheetData[1]['L']!="Technician"||$sheetData[1]['M']!="Tech Mobile") {
										$params['error'] = "Invalid Matrix Sheet Format! Please select valid format matrix sheet.";
										$this->view->params = $params;
									} else {
										$i=1;
										foreach($sheetData as $rec) {
											if($i != 1) {
												if ($rec['B'] != "") {
													$checkDuplicateDataQuery = "select * from tbl_matrix where site_id ='".trim($rec['A'])."' ";
													$checkDuplicateDataResult = $this->dbAdapter->fetchRow($checkDuplicateDataQuery);
													if ($checkDuplicateDataResult['site_id']==trim($rec['A'])) { 
														$duplicate_data_count += 1;
													} else {
														$insertMatrixData = array();
														$insertMatrixData['site_id']             = trim($rec['A']);
														$insertMatrixData['infratel_site_id']    = trim($rec['B']);
														$insertMatrixData['zone']                = trim($rec['C']);
														$insertMatrixData['ZDM']                 = trim($rec['D']);
														$insertMatrixData['ZDM_mobile']          = trim($rec['E']);
														$insertMatrixData['cluster']             = trim($rec['F']);
														$insertMatrixData['cluster_incharge']    = trim($rec['G']);
														$insertMatrixData['cluster_mobile']      = trim($rec['H']);
														$insertMatrixData['ZOM']                 = trim($rec['J']);
														$insertMatrixData['ZOM_mobile']          = trim($rec['K']);
														$insertMatrixData['tech_name']           = trim($rec['L']);
														$insertMatrixData['tech_mobile']         = trim($rec['M']);
														$insertMatrixData['importation_datetime']= date("Y-m-d H:i:s"); 
														$this->dbAdapter->insert('tbl_matrix', $insertMatrixData);
													}
												}
											}
											$i++;
										}
									}
									if ($duplicate_data_count > 0) {
										$this->_flashMessenger->addMessage(array('success'=>'Matrix data has been imported successfully but found '.$duplicate_data_count.' duplicate data.'));
										$this->_redirect('/manage-po-site/import-site-data');
									} else {
										$this->_flashMessenger->addMessage(array('success'=>'Matrix data has been imported successfully.'));
										$this->_redirect('/manage-po-site/import-site-data');
									}
								} else if ($params['type_of_sheet'] == 'Location') {
									if ($sheetData[1]['A'] != "Infratel ID" || $sheetData[1]['B'] != "Latitude" || $sheetData[1]['C'] != "Longitude") 
									{
										$params['error'] = "Invalid Location Sheet Format! Please select valid location ";
										$this->view->params = $params;
									} else {
										$i = 1;
										foreach($sheetData as $rec) {
											if($i != 1){
												if ($rec['A'] != "") {
													$checkDuplicateDataQuery = "select * from tbl_location_mapping where infratel_site_id ='".trim($rec['A'])."'";
													$checkDuplicateDataResult = $this->dbAdapter->fetchRow($checkDuplicateDataQuery);
													if ($checkDuplicateDataResult['infratel_site_id'] == trim($rec['A'])) {
														$duplicate_data_count += 1;
													} else {
														$locationInsertData = array();
														$locationInsertData['infratel_site_id']     		= trim($rec['A']);
														$locationInsertData['latitude']             = trim($rec['B']);
														$locationInsertData['longitude']          	= trim($rec['C']);
														$locationInsertData['importation_datetime'] = date("Y-m-d H:i:s");  
//														echo "<pre>";
//														print_r($locationInsertData);
														$this->dbAdapter->insert('tbl_location_mapping', $locationInsertData);
													}
												}
											}
											$i++;
										}
									}
									if ($duplicate_data_count > 0) {
										$this->_flashMessenger->addMessage(array('success'=>'Loaction data has been imported successfully but found '.$duplicate_data_count.' duplicate data.'));
										$this->_redirect('/manage-po-site/import-site-data');
									} else {
										$this->_flashMessenger->addMessage(array('success'=>'Loaction data has been imported successfully.'));
										$this->_redirect('/manage-po-site/import-site-data');
									}
								} else {
									$params['error'] = 'Sheet Type Missing! Please select type of sheet.';
									$this->view->params = $params;
								}
							}
						}
					}
				}
			}
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
	}

	/*
	 * Function to add PO and sites details manually
	 */ 
	public function addPoAndSitesAction()
	{
		try {
			// echo '<pre>';print_r($this->getRequest()->getParams());exit();

			$this->checklogin();
			$this->view->stateList = $this->master_model->getStateNameMasterList();
			$params = $this->getRequest()->getParams();
			if(isset($params['po'])){

			}else{
				if ($this->getRequest()->isPost()) {	
					$response = array();
					if (empty($params['state_id']) || $params['state_id'] == "") {
						$response['flag'] = false;
						$response['title'] = "State Missing!";
						$response['message'] = "Please select state name.";
					} else if (empty($params['client_id']) || $params['client_id'] == "") {
						$response['flag'] = false;
						$response['title'] = "Client Missing!";
						$response['message'] = "Please select client name.";
					} else if (empty($params['po_type']) || $params['po_type'] == "") {
						$response['flag'] = false;
						$response['title'] = "PO Type Missing!";
						$response['message'] = "Please select PO type.";
					} else if (empty($params['po_amount']) || $params['po_amount'] == "") {
						$response['flag'] = false;
						$response['title'] = "PO Amount Missing!";
						$response['message'] = "Please enter PO Amount.";
					} else if (empty($params['po_number']) || $params['po_number'] == "") {
						$response['flag'] = false;
						$response['title'] = "PO Number Missing!";
						$response['message'] = "Please enter PO number.";
					} else if (empty($params['po_date']) || $params['po_date'] == "") {
						$response['flag'] = false;
						$response['title'] = "PO Date Missing!";
						$response['message'] = "Please enter PO date.";
					} else if (empty($params['site_id']) || $params['site_id'] == "") {
						$response['flag'] = false;
						$response['title'] = "site id Missing!";
						$response['message'] = "Please enter site id.";
					} 
			//	else if ($params['revision'] == "") {
				//	$response['flag'] = false;
				//	$response['title'] = "PO Revision Missing!";
				//	$response['message'] = "Please enter PO revision.";
				//} 
					else {
						$this->dbAdapter->beginTransaction();
						$poDetailsQuery = $this->dbAdapter->select()
                		->from('tbl_po_details', array('*'))
                		->where('status=?',0)
                		->where('po_no=?',trim($params['po_number']))
                		->where('is_deleted=?',0);
            	         $poDetailsResult = $this->dbAdapter->fetchAll($poDetailsQuery);
            	       //  print_r($poDetailsResult);
            	       //  exit;
            	         if(empty($poDetailsResult)){
						$insertData = array();
						$insertData['state_id'] 		= trim($params['state_id']);
						$insertData['client_id'] 		= trim($params['client_id']);
						$insertData['po_no'] 			= trim($params['po_number']);
						$insertData['po_amount'] 		= trim($params['po_amount']);
						$insertData['document_type'] 	= trim($params['po_type']);
						$insertData['order_date'] 		= $this->dateConverter(trim($params['po_date']));
						$insertData['rev'] 				= trim($params['revision']);
						$insertData['site_type'] 		= trim($params['site_type']);
						$insertData['operating_unit'] 	= trim($params['operating_unit']);
						$insertData['status'] 			= "Open";
												
						$this->dbAdapter->insert('tbl_po_details', $insertData);
						$insertSiteDetails = array();
						$j = 0;
						foreach ($params['site_id'] as $site_id) {
							$insertSiteDetails['state_id'] 		= trim($params['state_id']);
							$insertSiteDetails['client_id'] 	= trim($params['client_id']);
							$insertSiteDetails['po_no'] 		= $params['po_number'];
							$insertSiteDetails['site_id'] 		= $site_id;
							$insertSiteDetails['site_name'] 	= $params['site_name'][$j];
							$insertSiteDetails['status'] 		= "0";
							$insertSiteDetails['order_date'] 	= $this->dateConverter(trim($params['po_date']));
							$insertSiteDetails['created_at'] 	= date('Y-m-d H:i:s');
							$this->dbAdapter->insert('tbl_po_sites', $insertSiteDetails);
							$j++;
						}
						$insertSiteDeploymentData = array();
						foreach ($params['infratel_id'] as $key => $infratel_id) {
							$insertSiteDeploymentData['state_id'] 		= trim($params['state_id']);
							$insertSiteDeploymentData['client_id'] 		= trim($params['client_id']);
							$insertSiteDeploymentData['po'] 			= $params['po_number'];
							$insertSiteDeploymentData['site_id'] 		= $params['site_id'][$key];
							$insertSiteDeploymentData['work_type'] 		= $params['work_type'][$key];
							$insertSiteDeploymentData['site_type'] 		= $params['site_type'][$key];
							$insertSiteDeploymentData['infratel_id'] 	= $infratel_id;
							if ($params['so_number'][$key]) {
								$insertSiteDeploymentData['so_no'] 		= $params['so_number'][$key];
							}
							if ($params['location'][$key]) {
								$insertSiteDeploymentData['location'] 		= $params['location'][$key];
							}
							$insertSiteDeploymentData['status'] 		= "0";
							$insertSiteDeploymentData['po_date'] 		= $this->dateConverter(trim($params['po_date']));
							$insertSiteDeploymentData['importation_datetime'] 	= date('Y-m-d H:i:s');
							$this->dbAdapter->insert('tbl_deployment', $insertSiteDeploymentData);
						}
						$insertSiteLocationData = array();
						foreach ($params['infratel_id'] as $key => $infratel_id) {
							$insertSiteLocationData['infratel_site_id'] 	= $infratel_id;
							if ($params['longitude'][$key]) {
								$insertSiteLocationData['longitude'] 		= $params['longitude'][$key];
							}
							if ($params['latitude'][$key]) {
								$insertSiteLocationData['latitude'] 		= $params['latitude'][$key];
							}
							$insertSiteLocationData['importation_datetime'] 	= date('Y-m-d H:i:s');
							$this->dbAdapter->insert('tbl_location_mapping', $insertSiteLocationData);
						}
						$this->dbAdapter->commit();
						$response['flag'] = true;
						$response['title'] = "Added Successfully";
						$response['message'] = "PO and Sites have been added successfully.";
            	         }else{
    					    $this->dbAdapter->commit();
    						$response['flag'] = false;
    						$response['title'] = "Not Added";
    						$response['message'] = "This PO Already Exist.";
    					    }
					}
					echo json_encode($response);
					exit;
				}
			}
		} catch(Exception $e) {
			echo $e->getMessage();
			$this->dbAdapter->rollBack();
			exit;
		}
	}


	public function addPoSitesAction()
	{
		try {
			// echo '<pre>';print_r($this->getRequest()->getParams());exit();

			$this->checklogin();
			$query = "Select distinct po_no from tbl_po_sites";
			$this->view->po_list = $po_list=$this->dbAdapter->fetchAll($query);
			// echo '<pre>';print_r($stateList);exit;
			$params = $this->getRequest()->getParams();
			
			if ($this->getRequest()->isPost()) {

				$response = array();
				try{


					$po_query ="Select * from tbl_po_details where po_no ='".$params['po']."'";
					$po_details = $this->dbAdapter->fetchRow($po_query);
					if (empty($params['po']) || $params['po'] == "") {
						$response['flag'] = false;
						$response['title'] = "State Missing!";
						$response['message'] = "Please select state name.";
					} 

					else {
						$this->dbAdapter->beginTransaction();
						$insertSiteDetails = array();
						$j = 0;

						foreach ($params['site_id'] as $site_id) {
							$insertSiteDetails['state_id'] 		= trim($po_details['state_id']);
							$insertSiteDetails['client_id'] 	= trim($po_details['client_id']);
							$insertSiteDetails['po_no'] 		= $params['po'];
							$insertSiteDetails['site_id'] 		= $site_id;
							$insertSiteDetails['site_name'] 	= $params['site_name'][$j];
							$insertSiteDetails['status'] 		= "0";
							$insertSiteDetails['order_date'] 	= $this->dateConverter(trim($po_details['po_date']));
							$insertSiteDetails['created_at'] 	= date('Y-m-d H:i:s');

							$this->dbAdapter->insert('tbl_po_sites', $insertSiteDetails);
							$j++;
						}
						$insertSiteDeploymentData = array();
						foreach ($params['infratel_id'] as $key => $infratel_id) {
							$insertSiteDeploymentData['state_id'] 		= trim($po_details['state_id']);
							$insertSiteDeploymentData['client_id'] 		= trim($po_details['client_id']);
							$insertSiteDeploymentData['po'] 			= $params['po'];
							$insertSiteDeploymentData['site_id'] 		= $params['site_id'][$key];
							$insertSiteDeploymentData['work_type'] 		= $params['work_type'][$key];
							$insertSiteDeploymentData['site_type'] 		= $params['site_type'][$key];
							$insertSiteDeploymentData['infratel_id'] 	= $infratel_id;
							if ($params['so_number'][$key]) {
								$insertSiteDeploymentData['so_no'] 		= $params['so_number'][$key];
							}
							if ($params['location'][$key]) {
								$insertSiteDeploymentData['location'] 		= $params['location'][$key];
							}
							$insertSiteDeploymentData['status'] 		= "0";
							$insertSiteDeploymentData['po_date'] 		= $this->dateConverter(trim($po_details['po_date']));
							$insertSiteDeploymentData['importation_datetime'] 	= date('Y-m-d H:i:s');
							$this->dbAdapter->insert('tbl_deployment', $insertSiteDeploymentData);
						}
						$insertSiteLocationData = array();
						foreach ($params['infratel_id'] as $key => $infratel_id) {
							$insertSiteLocationData['infratel_site_id'] 	= $infratel_id;
							if ($params['longitude'][$key]) {
								$insertSiteLocationData['longitude'] 		= $params['longitude'][$key];
							}
							if ($params['latitude'][$key]) {
								$insertSiteLocationData['latitude'] 		= $params['latitude'][$key];
							}
							$insertSiteLocationData['importation_datetime'] 	= date('Y-m-d H:i:s');
							$this->dbAdapter->insert('tbl_location_mapping', $insertSiteLocationData);
						}
						$this->dbAdapter->commit();
						$response['flag'] = true;
						$response['title'] = "Added Successfully";
						$response['message'] = "Sites have been added successfully.";
					}

				}catch(Exception $e){
					$response['flag'] = false;
					$response['title'] = "SQL Error!";
					$response['message'] = $e->getMessage();
				}	
				
				echo json_encode($response);
				exit;
			}
			
		} catch(Exception $e) {
			echo $e->getMessage();
			$this->dbAdapter->rollBack();
			exit;
		}
	}

	public function editPoAndSitesAction()
	{
		try {
			$this->checklogin();
			$params = $this->getRequest()->getParams();

			if(isset($params['po']) && $params['po'] != ""){

				$poDetailsQuery = $this->dbAdapter->select()
				->from('tbl_po_details', array('*'))
				->joinLeft('tbl_client_master','tbl_client_master.id = tbl_po_details.client_id', array('client_name'))
				->where('tbl_po_details.id = ?',$params['po'])
				->where('tbl_po_details.is_deleted = ?',0)
				->order('tbl_po_details.id desc');
				$poDetailsResult = $this->dbAdapter->fetchRow($poDetailsQuery);
				if($poDetailsResult){


					$this->view->po = $poDetailsResult;

					$poSitesQuery = $this->dbAdapter->select()
					->from('tbl_po_sites', array('*'))
					->where('po_no = ?',$poDetailsResult['po_no'])
					->where('is_deleted = ?', 0)
					->order('id desc');
					$poSitesResult = $this->dbAdapter->fetchAll($poSitesQuery);
					$this->view->po_sites = $poSitesResult;
					$this->view->controller = $this;

					$this->view->stateList = $this->master_model->getStateNameMasterList();
					if ($this->getRequest()->isPost()) {	
						$params = $this->getRequest()->getParams();
					
						$response = array();

						if (empty($params['po_id']) || $params['po_id'] == "") {
							$response['flag'] = false;
							$response['title'] = "Id Missing!";
							$response['message'] = "Please select id name.";
						} else if (empty($params['po_no']) || $params['po_no'] == "") {
							$response['flag'] = false;
							$response['title'] = "PO No Missing!";
							$response['message'] = "Please select PO.";
						}else if (empty($params['po_date']) || $params['po_date'] == "") {
							$response['flag'] = false;
							$response['title'] = "PO Date Missing!";
							$response['message'] = "Please select PO Date.";
						}else if (empty($params['po_amount']) || $params['po_amount'] == "") {
							$response['flag'] = false;
							$response['title'] = "PO Amount Missing!";
							$response['message'] = "Please Enter PO Amount.";
						} else if (empty($params['site_id']) || $params['site_id'] == "") {
						$response['flag'] = false;
						$response['title'] = "site id Missing!";
						$response['message'] = "Please enter site id.";
						} 
						else {
							$editlog =array();
							$editlog['id']=$this->id;
							$name = $this->dbAdapter->fetchRow('Select name from tbl_user where id ='.$this->id);
							$editlog['name']=$name['name'];
							$editlog['date']=date('Y-m-d H:i:s');
							$editlog = json_encode($editlog);
							$site_type = $params['site_type'] ?? null;
							$date = explode('/', $params['po_date']);
                        	$final_date = $date['2'].'-'.$date['1'].'-'.$date['0'];
                        	$orderdate =  $final_date;
 
							// $this->dbAdapter->beginTransaction();
							$updatePoSql = "update tbl_po_details set order_date='".$orderdate."' , po_amount='".$params['po_amount']."', state_id='".$params['state_id']."' ,site_type = '".$site_type."',edit_log = '".$editlog."' where id=".$params['po_id'];

							$this->dbAdapter->query($updatePoSql);
							
				// 			foreach ($params['po_site_deployment_id'] as $po_site_deployment_id) {
								
				// 				// $updatePoSql = "update tbl_deployment set work_type = '".$params['work_type'][$key]."' where po='".$params['po_number']."' and infratel_id ='".$infratel_id."' ";
				// 				$updatePoSql1 = "update tbl_deployment set po_date='".$this->dateConverter(trim($params['po_date']))."',so_no = '".$params['so_number']."',work_type = '".$params['work_type']."', infratel_id = '".$params['infratel_id']."' where id='".$po_site_deployment_id."' ";
				// 				$this->dbAdapter->query($updatePoSql);
				// 			}
				
				            $i = 0;
							$a = 0;
							foreach ($params['po_site_deployment_id'] as $po_site_deployment_id) {
								$checkSql1 = $this->dbAdapter->select()
								->from('tbl_deployment', array('*'))
								->where('id = ?',$po_site_deployment_id);
								$siteDetailsResult1 = $this->dbAdapter->fetchRow($checkSql1);
								if($siteDetailsResult1){
								// 	$updateSql = "update tbl_po_sites set site_name = '".$params['site_name'][$j]."' where id=".$po_site_id;
								$updateSql1 = "update tbl_deployment set po_date='".$orderdate."',so_no = '".$params['so_number'][$a]."',work_type = '".$params['work_type'][$a]."',site_type = '".$params['site_type']."', infratel_id = '".$params['infratel_id'][$a]."', location = '".$params['location'][$a]."' where id='".$po_site_deployment_id."' ";
									$this->dbAdapter->query($updateSql1);
								}

								$a++;
							}


							$j = 0;
							$k = 0;
							foreach ($params['po_site_id'] as $po_site_id) {
								$checkSql = $this->dbAdapter->select()
								->from('tbl_po_sites', array('*'))
								->where('id = ?',$po_site_id);
								$siteDetailsResult = $this->dbAdapter->fetchRow($checkSql);
								if($siteDetailsResult){
								    //echo $this->dateConverter(trim($params['po_date'][$j]));
								// 	$updateSql = "update tbl_po_sites set site_name = '".$params['site_name'][$j]."' where id=".$po_site_id;
								$updateSql = "update tbl_po_sites set order_date='".$orderdate."',site_name = '".$params['site_name'][$j]."' where id=".$po_site_id;
									$this->dbAdapter->query($updateSql);
								}

								$j++;
							}
							// if(isset($params['new_site']) && count($params['new_site'])){
							// 	foreach ($params['new_site'] as $po_site_id) {
							// 		$checkSql = $this->dbAdapter->select()
							// 		->from('tbl_po_sites', array('*'))
							// 		->where('id = ?',$po_site_id);
							// 		$siteDetailsResult = $this->dbAdapter->fetchRow($checkSql);
							// 		if($siteDetailsResult){
							// 			$updateSql = "update tbl_po_sites set site_name = '".$params['site_name'][$j]."' where id=".$po_site_id;
							// 			$this->dbAdapter->query($updateSql);
							// 		}
							// 		$j++;
							// 	}
							// }

							// $this->dbAdapter->commit();
							$response['flag'] = true;
							$response['title'] = "Added Successfully";
							$response['message'] = "PO and Sites have been updated successfully.";
						}
						echo json_encode($response);
						exit;
					}
				}else{
					$this->_redirect('/manage-po-site/po-details/');

				}

				

			}else{
			   
				$this->_redirect('/manage-po-site/po-details/');
			}


		} catch(Exception $e) {

    $this->_helper->layout()->disableLayout();
    $this->_helper->viewRenderer->setNoRender(true);

    echo json_encode([
        'flag' => false,
        'title' => 'Server Error',
        'message' => $e->getMessage()
    ]);
    exit;
}
	}

	function getDeploymentData($site_id,$po_no){
		try{
			$deployment_sql = "select * from tbl_deployment where po = '".$po_no."' and site_id='".$site_id."'";
			$deployment = $this->dbAdapter->fetchRow($deployment_sql);
			return $deployment;
		}catch(Exception $e){
			echo $e->getMessage();exit;
		}
	}
	function getLocationData($infratel_site_id){
		$location_sql = "select * from tbl_location_mapping where infratel_site_id = '".$infratel_site_id."'";
		$location = $this->dbAdapter->fetchRow($location_sql);
		return $location;
	}
	public function getSiteMatrixDataAction(){
		try{
			$params = $this->getRequest()->getParams();
			$matrix_sql = "select * from tbl_site_matrix where technical_site_id LIKE '".$params['site_id']."%'";
			$matrix = $this->dbAdapter->fetchRow($matrix_sql);
			echo json_encode($matrix);
		}catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
		exit;
		
	}


	// Function to get list of incidents occured on sites
	public function siteIncidentsReportAction()
	{
		try {	
			$this->checklogin();
			$params = $this->getRequest()->getParams();
			$poNumberListQuery = $this->dbAdapter->select()
			->from("tbl_po_details", array("id","po_no"))
			->where('is_deleted=?',0)
			->order("po_no asc");
			$this->view->poNumbers = $poNumberListResult = $this->dbAdapter->fetchAll($poNumberListQuery);
			$getUserListQuery = $this->dbAdapter->select()
			->from('tbl_user', array('id','name'))
			->where('status = 1')
			->where('role_type != 1');
			$this->view->userList = $getUserListResult = $this->dbAdapter->fetchAll($getUserListQuery);
			if($params['incident_type'] == 1){
				$getIncidentsReportListQuery = $this->dbAdapter->select()
				->from('tbl_site_incidents_report as tsir', array('*'))
				->where('type = 1')
				->order('incident_date desc');
			}else if($params['incident_type']==2){
				$getIncidentsReportListQuery = $this->dbAdapter->select()
				->from('tbl_site_incidents_report as tsir', array('*'))
				->where('type = 2')
				->order('incident_date desc');
			}else{
				$getIncidentsReportListQuery = $this->dbAdapter->select()
				->from('tbl_site_incidents_report as tsir', array('*'))
				->order('incident_date desc');
			}

			$getIncidentsReportListResult = $this->dbAdapter->fetchAll($getIncidentsReportListQuery);
			$incidentReportArray = array();
			foreach ($getIncidentsReportListResult as $incidentReport) {
				$getUserAndVendorNameQuery = $this->dbAdapter->select()->from('tbl_incident_report_person as tirp', array('*'))
				->joinLeft('tbl_user as tu','tu.id = tirp.user_id', array('name'))
				->joinLeft('tbl_vendor as tv','tv.id = tirp.vendor_id', array('vendor_name'))
				->where('tirp.incident_id = ?', $incidentReport['id']);
				$getUserAndVendorNameResult = $this->dbAdapter->fetchAll($getUserAndVendorNameQuery);
				$incidentReport['responsible_staff'] = implode(',', array_column($getUserAndVendorNameResult, 'name'));
				$vendorNames = implode(',',array_column($getUserAndVendorNameResult, 'vendor_name'));
				$vendorNamesTempArray = explode(',', $vendorNames);
				$vendorNameArray = array_unique($vendorNamesTempArray);
				$incidentReport['responsible_vendor'] = implode(',', $vendorNameArray);
				array_push($incidentReportArray, $incidentReport);
//				echo "<pre>";
//                print_r($incidentReport);
			}
			$this->view->incidentsList = $incidentReportArray;
		} catch(Exception $e) {
			echo $e->getMessage();
			exit;
		}
	} 

	// Function to get incidents list by search key
	public function getIncidentListBySearchKeyAction()
	{
		try {
			$this->checklogin();
			$response = array();
			$params = $this->getRequest()->getParams();
			$incidentReportArray = array();
			if ($this->getRequest()->isPost()) {
				if ((empty($params['user_id']) || $params['user_id'] == "") && (empty($params['po_no']) || $params['po_no'] == "") && (empty($params['site_id']) || $params['site_id'] == "")) {
					$response['flag'] = false;
					$response['title'] = "Search Key Missing!";
					$response['message'] = "Please select atleast one search key.";
					echo json_encode($response);
					exit;
				} else {
					if ((isset($params['user_id']) && $params['user_id']) && (isset($params['po_no']) && $params['po_no']) && (isset($params['site_id']) && $params['site_id'])) {
						$getIncidentsReportListQuery = $this->dbAdapter->select()
						->from('tbl_site_incidents_report as tsir', array('*'))
						->joinLeft('tbl_incident_report_person as tirp','tirp.incident_id = tsir.id', array('*'))
						->where('tsir.po_no = ?', $params['po_no'])
						->where('tsir.site_id = ?', $params['site_id'])
						->where('tirp.user_id = ?', $params['user_id']);
						$getIncidentsReportListResult = $this->dbAdapter->fetchAll($getIncidentsReportListQuery);
						foreach ($getIncidentsReportListResult as $incidentReport) {
							$getUserAndVendorNameQuery = $this->dbAdapter->select()->from('tbl_incident_report_person as tirp', array('*'))
							->joinLeft('tbl_user as tu','tu.id = tirp.user_id', array('name'))
							->joinLeft('tbl_vendor as tv','tv.id = tirp.vendor_id', array('vendor_name'))
							->where('tirp.incident_id = ?', $incidentReport['incident_id']);
							$getUserAndVendorNameResult = $this->dbAdapter->fetchAll($getUserAndVendorNameQuery);
							$incidentReport['responsible_staff'] = implode(',', array_column($getUserAndVendorNameResult, 'name'));
							// $incidentReport['responsible_vendor'] = implode(',', array_column($getUserAndVendorNameResult, 'vendor_name'));
							$vendorNames = implode(',',array_column($getUserAndVendorNameResult, 'vendor_name'));
							$vendorNamesTempArray = explode(',', $vendorNames);
							$vendorNameArray = array_unique($vendorNamesTempArray);
							$incidentReport['responsible_vendor'] = implode(',', $vendorNameArray);
							array_push($incidentReportArray, $incidentReport);
							// echo "<pre>";
							// print_r($getUserAndVendorNameResult);exit;
						}
					} else if ((isset($params['po_no']) && $params['po_no']) && (isset($params['site_id']) && $params['site_id'])) {
						$getIncidentsReportListQuery = $this->dbAdapter->select()
						->from('tbl_site_incidents_report', array('*'))
						->where('po_no = ?', $params['po_no'])
						->where('site_id = ?', $params['site_id']);
						$getIncidentsReportListResult = $this->dbAdapter->fetchAll($getIncidentsReportListQuery);
						foreach ($getIncidentsReportListResult as $incidentReport) {
							$getUserAndVendorNameQuery = $this->dbAdapter->select()->from('tbl_incident_report_person as tirp', array('*'))
							->joinLeft('tbl_user as tu','tu.id = tirp.user_id', array('name'))
							->joinLeft('tbl_vendor as tv','tv.id = tirp.vendor_id', array('vendor_name'))
							->where('tirp.incident_id = ?', $incidentReport['id']);
							$getUserAndVendorNameResult = $this->dbAdapter->fetchAll($getUserAndVendorNameQuery);
							$incidentReport['responsible_staff'] = implode(',', array_column($getUserAndVendorNameResult, 'name'));
							// $incidentReport['responsible_vendor'] = implode(',', array_column($getUserAndVendorNameResult, 'vendor_name'));
							$vendorNames = implode(',',array_column($getUserAndVendorNameResult, 'vendor_name'));
							$vendorNamesTempArray = explode(',', $vendorNames);
							$vendorNameArray = array_unique($vendorNamesTempArray);
							$incidentReport['responsible_vendor'] = implode(',', $vendorNameArray);
							array_push($incidentReportArray, $incidentReport);
						}
					} else if (isset($params['user_id']) && $params['user_id']) {
						$getIncidentsByUserIdQuery = $this->dbAdapter->select()
						->from('tbl_incident_report_person as tirp', array('*'))
						->joinLeft('tbl_user as tu','tu.id = tirp.user_id', array('name as responsible_staff'))
						->joinLeft('tbl_vendor as tv','tv.id = tirp.vendor_id', array('vendor_name as responsible_vendor'))
						->where('tirp.user_id = ?', $params['user_id']);
						$getIncidentsByUserIdResult = $this->dbAdapter->fetchAll($getIncidentsByUserIdQuery);
						foreach ($getIncidentsByUserIdResult as $incidentReport) {
							$getIncidentDetailsQuery = $this->dbAdapter->select()->from('tbl_site_incidents_report', array('*'))
							->where('id = ?', $incidentReport['incident_id']);
							$getIncidentDetailsResult = $this->dbAdapter->fetchRow($getIncidentDetailsQuery);
							$incidentReportDetailsArray = array_merge($incidentReport, $getIncidentDetailsResult);
							array_push($incidentReportArray, $incidentReportDetailsArray);
						}
					}
					$this->view->incidentsList = $incidentReportArray;
				}
			} else {
				$response['flag'] = false;
				$response['title'] = "Invalid Request Type!";
				$response['message'] = "Please try after refreshing the page.";
				echo json_encode($response);
				exit;
			}
		} catch(Exception $e) {
			echo $e->getMessage();
			exit;
		}
		$this->_helper->layout()->disableLayout();
	}

	// Function to open the form to report new incident
	public function reportNewIncidentAction()
	{
		try {
			$this->checklogin();
			$poNumberListQuery = $this->dbAdapter->select()
			->from("tbl_po_details", array("id","po_no"))
			->where('is_deleted=?',0)
			->order("po_no asc");
			$this->view->poNumbers = $poNumberListResult = $this->dbAdapter->fetchAll($poNumberListQuery);
			$getUserListQuery = $this->dbAdapter->select()
			->from('tbl_user', array('id','name'))
			->where('status = 1')
			->where('role_type != 1');
			$this->view->userList = $getUserListResult = $this->dbAdapter->fetchAll($getUserListQuery);
			$getVendorListQuery = $this->dbAdapter->select()
			->from('tbl_vendor', array('id','vendor_name','contact_person'))
			->where('status = 1');
			$this->view->vendorList = $getvendorListResult = $this->dbAdapter->fetchAll($getVendorListQuery);
		} catch(Exception $e) {
			echo $e->getMessage();
			exit;
		}
	}

	// Function to save report of new incident on site
	public function saveReportNewIncidentAction()
	{
		try {
			$this->checklogin();
			$response = array();
			$params = $this->getRequest()->getParams();
// 			echo '<pre>';print_r($params['type']);exit;
			if($params['type']==2){
			 //   print_r($params['type']);exit;
				if ($this->getRequest()->isPost()) {
					if (empty($params['incident_date']) || $params['incident_date'] == "") {
						$response['flag'] = false;
						$response['title'] = "Incident Date Missing!";
						$response['message'] = "Please select incident date.";
					} else if (empty($params['po_no']) || $params['po_no'] == "") {
						$response['flag'] = false;
						$response['title'] = "PO Number Missing!";
						$response['message'] = "Please select PO number.";
					} else if (empty($params['site_id']) || $params['site_id'] == "") {
						$response['flag'] = false;
						$response['title'] = "Site ID Missing!";
						$response['message'] = "Please select site ID.";
					} else if (empty($params['employee_id']) || $params['employee_id'] == "") {
						$response['flag'] = false;
						$response['title'] = "Employee Missing!";
						$response['message'] = "Please select employee name.";
					} else if (empty($params['incident_report']) || $params['incident_report'] == "") {
						$response['flag'] = false;
						$response['title'] = "Incident Report Missing!";
						$response['message'] = "Please enter incident report.";
					} else {
						$insertData = array();
				// 		$insertData['incident_type']=$params['type'];
						$insertData['type']=$params['type'];
						$insertData['po_no'] 			= trim($params['po_no']);
						$insertData['site_id'] 			= trim($params['site_id']);
						$insertData['incident'] 		= trim($params['incident_report']);
						$insertData['incident_date'] 	= $this->dateConverter(trim($params['incident_date']));
						if ($params['incident_effect']) {
							$insertData['incident_consequence'] = trim($params['incident_effect']);
						}
						$insertData['created_by'] 			= $this->id;
						$insertData['created_at'] 			= date('Y-m-d H:i:s');
						$this->dbAdapter->insert('tbl_site_incidents_report', $insertData);
						$lastInsertedId = $this->dbAdapter->lastInsertId();
						foreach ($params['employee_id'] as $key => $employee) {
							$insertPersonData = array();
							$insertPersonData['incident_id'] = $lastInsertedId;
							$insertPersonData['user_id'] = $employee;
							if ($params['vendor_id']) {
								$insertPersonData['vendor_id'] = $params['vendor_id'];
							}
							$this->dbAdapter->insert('tbl_incident_report_person', $insertPersonData);
						}
						$response['flag'] = true;
						$response['title'] = "Saved Successfully";
						$response['message'] = "Incident report has been saved successfully.";
					}
				}else {
					$response['flag'] = false;
					$response['title'] = "Invalid Request Type!";
					$response['message'] = "Please try again after refreshing the page.";
				}
			}else if($params['type']==1){
				if ($this->getRequest()->isPost()) {
					if (empty($params['incident_date']) || $params['incident_date'] == "") {
						$response['flag'] = false;
						$response['title'] = "Incident Date Missing!";
						$response['message'] = "Please select incident date.";
					}else if (empty($params['employee_id']) || $params['employee_id'] == "") {
						$response['flag'] = false;
						$response['title'] = "Employee Missing!";
						$response['message'] = "Please select employee name.";
					} else if (empty($params['incident_report']) || $params['incident_report'] == "") {
						$response['flag'] = false;
						$response['title'] = "Incident Report Missing!";
						$response['message'] = "Please enter incident report.";
					} else {
						$insertData = array();
				// 		$insertData['incident_type']=$params['type'];
						$insertData['type']=$params['type'];
						$insertData['incident'] 		= trim($params['incident_report']);
						$insertData['incident_date'] 	= $this->dateConverter(trim($params['incident_date']));
						if ($params['incident_effect']) {
							$insertData['incident_consequence'] = trim($params['incident_effect']);
						}
						$insertData['created_by'] 			= $this->id;
						$insertData['created_at'] 			= date('Y-m-d H:i:s');
						$this->dbAdapter->insert('tbl_site_incidents_report', $insertData);
						$lastInsertedId = $this->dbAdapter->lastInsertId();
						foreach ($params['employee_id'] as $key => $employee) {
							$insertPersonData = array();
							$insertPersonData['incident_id'] = $lastInsertedId;
							$insertPersonData['user_id'] = $employee;
							if ($params['vendor_id']) {
								$insertPersonData['vendor_id'] = $params['vendor_id'];
							}
							$this->dbAdapter->insert('tbl_incident_report_person', $insertPersonData);
						}
						$response['flag'] = true;
						$response['title'] = "Saved Successfully";
						$response['message'] = "Office Incident report has been saved successfully.";
					}
				}else {
					$response['flag'] = false;
					$response['title'] = "Invalid Request Type!";
					$response['message'] = "Please try again after refreshing the page.";
				}
			}
		} catch(Exception $e) {
			$response['flag'] = false;
			$response['title'] = "Internal Server Error!";
			$response['message'] = $e->getMessage();
		}
		echo json_encode($response);
		exit;
	}

// Function to view incident details as per request 
	public function viewIncidentReportDetailsAction()
	{
		try {
			$this->checklogin();
			$response = array();
			$params = $this->getRequest()->getParams();
			if ($this->getRequest()->isPost()) {
				if (empty($params['incident_id']) || $params['incident_id'] == "") {
					$response['flag'] = false;
					$response['title'] = "Incident ID Missing!";
					$response['message'] = "Please try again after refreshing the page.";
				} else {
					$getIncidentDetailsQuery = $this->dbAdapter->select()
					->from('tbl_site_incidents_report', array('*'))
					->where('id = ?', $params['incident_id']);
					$getIncidentDetailsResult = $this->dbAdapter->fetchRow($getIncidentDetailsQuery);
					$response['incident_report'] = $getIncidentDetailsResult['incident'];
					$response['incident_effect'] = $getIncidentDetailsResult['incident_consequence'];
					$response['flag'] = true;
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
 * Function to get po list for ajax request
 * @param state_id, client_id
 */
public function getPoListByStateAndClientAction()
{
	try {
		$this->checklogin();
		$response = array();
		$params = $this->getRequest()->getParams();
		if ($this->getRequest()->isPost()) {
			if (empty($params['state_id']) || $params['state_id'] == "") {
				$response['flag'] = false;
				$response['title'] = "State Missing!";
				$response['message'] = "Please select state name.";
			} else if ($params['client_id'] == "") {
				$response['flag'] = false;
				$response['title'] = "Client Missing!";
				$response['message'] = "Please select client name.";
			} else {
				$checkValidState = $this->master_model->checkValidStateId($params['state_id']);
				$checkValidClient = $this->master_model->checkValidClientId($params['client_id']);
				if (!$checkValidState) {
					$response['flag'] = false;
					$response['title'] = "Invalid State ID!";
					$response['message'] = "Please try again after refreshing the page.";
				} else if (!$checkValidClient) {
					$response['flag'] = false;
					$response['title'] = "Invalid Client ID!";
					$response['message'] = "Please try again after refreshing the page.";
				} else {
					$poList = $this->manage_po_site_model->getPoList($params['state_id'], $params['client_id']);
					if ($poList) {
						$options = '';
						foreach ($poList as $po) {
							$options .= '<option value="'.$po['po_no'].'">'.$po['po_no'].'</option>';
						}
						$response['flag'] = true;
						$response['poList'] = $options;
					} else {
						$response['flag'] = false;
						$response['title'] = "PO Not Found!";
						$response['message'] = "Please add PO for selected state and client.";
					}
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
	// Function to convert date into SQL Format date
function dateConverter($var){
    
	$date = explode('/', $var);
	$final_date = $date['2'].'-'.$date['1'].'-'.$date['0'];
	return $final_date;
}

public function checklogin(){   
	$auth           = Zend_Auth::getInstance(); 
	$errorMessage   = ""; 
	/*************** check user identity ************/
	if(!$auth->hasIdentity()){
		$this->_redirect('/admin/index');  
	}   
} 

public function siteIncidentFormAction(){
	try { 
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$poNumberListQuery = $this->dbAdapter->select()
		->from("tbl_po_details", array("id","po_no"))
		->where('is_deleted=?',0)
		->order("po_no asc");
		$this->view->poNumbers = $poNumberListResult = $this->dbAdapter->fetchAll($poNumberListQuery);
		$getUserListQuery = $this->dbAdapter->select()
		->from('tbl_user', array('id','name'))
		->where('status = 1')
		->where('role_type != 1');
		$this->view->userList = $getUserListResult = $this->dbAdapter->fetchAll($getUserListQuery);
		$this->view->incident_type = $params['incident_type'];
		$getVendorListQuery = $this->dbAdapter->select()
		->from('tbl_vendor', array('id','vendor_name','contact_person'))
		->where('status = 1');
		$this->view->vendorList = $getvendorListResult = $this->dbAdapter->fetchAll($getVendorListQuery);
	}catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
	$this->_helper->layout()->disableLayout();

}

public function officeIncidentFormAction(){
	try { 
		$this->checklogin();
		$params = $this->getRequest()->getParams();
		$this->view->incident_type = $params['incident_type'];
		$getUserListQuery = $this->dbAdapter->select()
		->from('tbl_user', array('id','name'))
		->where('status = 1')
		->where('role_type != 1');
		$this->view->userList = $getUserListResult = $this->dbAdapter->fetchAll($getUserListQuery);
	}catch(Exception $e){
		echo $e->getMessage();
		exit;
	}
	$this->_helper->layout()->disableLayout();

}



}

?>