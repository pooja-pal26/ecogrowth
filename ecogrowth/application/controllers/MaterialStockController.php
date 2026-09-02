<?php 

/*
 * Logimetrix Techsolutions Pvt Ltd
 * File Name : MaterialStockConroller.php
 * File Description : This controller manages the material stock such as entry of stock, consumption of  * stock, remaining stock, expenses on stock, ect.
 * @url : /material-stock
 * Created By : Amit Chaurasiya
 * Created Date : 26-Oct-2018
 */

class MaterialStockController extends Zend_Controller_Action
{
	public function init()
	{
		/* Initialize action controller here */
		$this->_flashMessenger  = $this->_helper->getHelper('FlashMessenger');
		$this->initView();
		$bootstrap              = $this->getInvokeArg('bootstrap');
		$aConfig                = $bootstrap->getOptions();
		$this->view->siteurl    = $aConfig['site']['image']['url'];
		$this->dbAdapter        = Zend_Db_Table::getDefaultAdapter(); 
		$auth                   = Zend_Auth::getInstance();
		$authStorage           = $auth->getStorage();
         //$this->WebLoginID      = $authStorage->read()->WebLoginID;
		$this->id              = $authStorage->read()->id;
		$this->role            = $authStorage->read()->role;
		$this->name            = $authStorage->read()->name;
	}

	public function materialStockInAction(){
		try{
			$this->checklogin();
			$this->view->messages = $messages = $this->_flashMessenger->getMessages();
			$params = $this->getRequest()->getParams();
			$userQuery = $this->dbAdapter->select()->from('tbl_user', array('id','name'))->where('role_type=?','3')->where('status=?','1');
			$this->view->users = $userResult = $this->dbAdapter->fetchAll($userQuery);
			$supplierDetailsQuery = $this->dbAdapter->select()->from('tbl_suppliers', array('*'));
			$this->view->supplierDetails = $supplierDetailsResult = $this->dbAdapter->fetchAll($supplierDetailsQuery);
			$productTypeQuery = $this->dbAdapter->select()->from('tbl_product_type', array('*'));
			$this->view->productType = $productTypeResult = $this->dbAdapter->fetchAll($productTypeQuery);
			$materialBrandQuery = $this->dbAdapter->select()->from('tbl_material_brand', array('*'));
			$this->view->materialBrand = $materialBrandResult = $this->dbAdapter->fetchAll($materialBrandQuery);
			if ($this->getRequest()->isPost()) {
				$dataArray = array();
				$dataArray['stock_in_date'] 	= $this->dateConverter($params['dateOfStockIn']);
				$dataArray['supplier_id'] 		= $params['supplier'];
				$dataArray['recieved_by'] 		= $params['recieved_by'];
				$dataArray['bill_number'] 		= $params['bill_no'];
				$dataArray['bill_date'] 		= $this->dateConverter($params['bill_date']);
				$dataArray['remarks'] 			= $params['remarks'];
				$dataArray['created_by']		= $this->id;
				$dataArray['created_at']		= date('Y-m-d H:i:s');
				$this->dbAdapter->insert('tbl_stock_in', $dataArray);
				$lastInsertId = $this->dbAdapter->lastInsertId();
				foreach ($params['product_category'] as $key => $value) {
					$stockDetailsArray['stock_in_id']			= $lastInsertId;
					$stockDetailsArray['product_type']			= $value;
					$stockDetailsArray['product_name']			= trim($params['product_id'][$key]);
					$stockDetailsArray['unit']					= trim($params['unit'][$key]);
					$stockDetailsArray['brand_name']			= $params['brand'][$key];
					$stockDetailsArray['quantity']				= trim($params['quantity'][$key]);
					$stockDetailsArray['created_at']			= date('Y-m-d H:i:s');				
					$this->dbAdapter->insert('tbl_stock_in_details', $stockDetailsArray);

					$totalQuantityQuery ="SELECT quantity FROM `tbl_inventory` WHERE product_type_id='".$value."' and product_id='".$params['product_id'][$key]."'";
					$totalQuantityResult = $this->dbAdapter->fetchRow($totalQuantityQuery);

					if($totalQuantityResult){
						$product_inventory = trim($params['quantity'][$key] + $totalQuantityResult['quantity']);

						$sqlUpdateProductInventory = "update tbl_inventory set quantity = '".$product_inventory."' where product_type_id='".$value."' and product_id='".$params['product_id'][$key]."'";
						$this->dbAdapter->query($sqlUpdateProductInventory);
					}
					else{
						$insertNewProduct = array();
						$insertNewProduct['product_type_id']	= $value;
						$insertNewProduct['product_id']	        = trim($params['product_id'][$key]);
						$insertNewProduct['brand_name']	        = trim($params['brand'][$key]);
						$insertNewProduct['unit']			    = trim($params['unit'][$key]);
						$insertNewProduct['quantity']			= trim($params['quantity'][$key]);
						$insertNewProduct['created_at']		    = date('Y-m-d H:i:s');
						$this->dbAdapter->insert('tbl_inventory', $insertNewProduct);
					}
				}
				$this->_flashMessenger->addMessage('Stock details have been saved successfully.');
				$this->_redirect('/material-stock/material-stock-in');
			} else {

			}
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
	}

	public function editMaterialStockDetailsAction()
	{
		try{
			$this->checklogin(); 
			$this->view->messages  = $this->_flashMessenger->getMessages();
			$db = $this->db=Zend_Db_Table::getDefaultAdapter();
			$dbAdapter = $this->dbAdapter;
			$params = $this->getRequest()->getParams(); 

			$supplierDetailsQuery = $this->dbAdapter->select()->from('tbl_suppliers', array('*'));
			$this->view->supplierDetails = $supplierDetailsResult = $this->dbAdapter->fetchAll($supplierDetailsQuery);


			$productTypeQuery = $this->dbAdapter->select()->from('tbl_product_type', array('*'));
			$this->view->productType = $productTypeResult = $this->dbAdapter->fetchAll($productTypeQuery);
			$materialBrandQuery = $this->dbAdapter->select()->from('tbl_material_brand', array('*'));
			$this->view->materialBrand = $materialBrandResult = $this->dbAdapter->fetchAll($materialBrandQuery);

			$productListQuery = $this->dbAdapter->select()->from('tbl_products', array('*'));
			$this->view->productListResult = $this->dbAdapter->fetchAll($productListQuery);

			$sql_unit = "SELECT * FROM tbl_stock_in_details WHERE stock_in_id = '".$params['stockID']."'";
			$this->view->stockinlist = $stockinlist = $this->dbAdapter->fetchAll($sql_unit);

			$stocksql = "SELECT tbl_stock_in.stock_in_date,tbl_stock_in.recieved_by,tbl_stock_in.bill_number,tbl_stock_in.bill_date,tbl_stock_in.remarks,tbl_suppliers.name FROM `tbl_stock_in` 
			LEFT JOIN `tbl_suppliers` ON (tbl_stock_in.supplier_id = tbl_suppliers.id) where tbl_stock_in.id ='".$params['stockID']."'";
			$this->view->stockdetail = $stockdetail = $this->dbAdapter->fetchRow($stocksql);
			// echo "<pre>";
			// print_r($stocksql);
			// exit();

			if($this->getRequest()->isPost()) {

				$stockInData  = array();     
				$stockInData['stock_in_date'] 	= $this->dateConverter($params['dop']);
				$stockInData['supplier_id'] 		= $params['supplier'];
				$stockInData['recieved_by'] 		= $params['recieved_by'];
				$stockInData['bill_number'] 		= $params['bill_no'];
				$stockInData['bill_date'] 		= $this->dateConverter($params['bill_date']);
				$stockInData['remarks'] 			= $params['remarks'];
				$stockInData['created_by']		= $this->id;
				$stockInData['created_at']		= date('Y-m-d H:i:s');

				
				$this->dbAdapter->update('tbl_stock_in', $stockInData, array('id=?'=>$params['stockID']));

				$deleteSql = "delete from tbl_stock_details where stock_in_id=".$params['stockID'];
				$this->dbAdapter->query($deleteSql);
				
				foreach ($params['product_category'] as $key => $value) {
					$stockDetailsArray['stock_in_id']			= $params['stockID'];
					$productTypeQuery = $this->dbAdapter->select()->from('tbl_product_type', array('product_type_name'))->where('id=?', $value);
					$productTypeResult = $this->dbAdapter->fetchRow($productTypeQuery);
					$stockDetailsArray['product_type']			= trim($productTypeResult['product_type_name']);
					$productDetailsQuery = $this->dbAdapter->select()->from('tbl_products', array('product_name', 'unit'))->where('id=?', $params['product_id'][$key]);
					$productDetailsResult = $this->dbAdapter->fetchRow($productDetailsQuery);
					$stockDetailsArray['product_name']			= trim($productDetailsResult['product_name']);
					$stockDetailsArray['unit']					= trim($productDetailsResult['unit']);
					$brandNameQuery = $this->dbAdapter->select()->from('tbl_material_brand', array('brand_name'))->where('id=?', $params['brand'][$key]);
					$brandNameResult = $this->dbAdapter->fetchRow($brandNameQuery);
					$stockDetailsArray['brand_name']			= trim($brandNameResult['brand_name']);
					$stockDetailsArray['quantity']				= trim($params['quantity'][$key]);
					$stockDetailsArray['created_at']			= date('Y-m-d H:i:s');
					$this->dbAdapter->insert('tbl_stock_details', $stockDetailsArray);
				}

				$this->_flashMessenger->addMessage('Data has been updated');
				$this->_redirect('/report/material-stock-in-report');
			}





			
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
	}


	public function materialStockOutAction(){
		$this->checklogin(); 
		try{
			$this->view->messages  = $this->_flashMessenger->getMessages();
			$db = $this->db=Zend_Db_Table::getDefaultAdapter();
			$dbAdapter = $this->dbAdapter;
			$params = $this->getRequest()->getParams(); 
			$getProduct = "SELECT * FROM tbl_product_type";
			$this->view->productlist = $productlist = $this->dbAdapter->fetchAll($getProduct);
			$getPoList = "SELECT DISTINCT(po_no) AS po_number FROM `tbl_po_sites` ORDER BY po_no";
			$this->view->po_list = $po_list = $this->dbAdapter->fetchAll($getPoList);
			$getbrandlist = "SELECT * FROM tbl_material_brand WHERE is_active = 1 ORDER BY brand_name ASC";
			$this->view->brandlist = $brandlist = $this->dbAdapter->fetchAll($getbrandlist);
			if($this->getRequest()->isPost()) {
				$stockoutdata=array();
				$stockoutdata['stock_out_date'] 	= date("Y-m-d", strtotime($params['date_of_stock_out']));;
				$stockoutdata['received_by'] 		= $params['stock_allocated_to'];
				$stockoutdata['po_no'] 		        = $params['po_number'];
				$stockoutdata['site_id'] 		    = $params['site_id'];
				$stockoutdata['allocated_by'] 		= $this->name;

				$this->dbAdapter->insert('tbl_stock_out', $stockoutdata);
				$lastInsertId = $this->dbAdapter->lastInsertId();
				foreach ($params['product_category'] as $key => $value) {

					$stockQuantityUpdationRowIdQuery = $this->dbAdapter->select()->from('tbl_inventory',array('id', 'quantity'))->where('product_type_id=?',$params['product_category'][$key])->where('product_id=?',$params['product_id'][$key]);
					$stockQuantityUpdationRowIdResutl = $this->dbAdapter->fetchRow($stockQuantityUpdationRowIdQuery);

					if($stockQuantityUpdationRowIdResutl['quantity'] >= $params['quantity'][$key]){
						$stockoutdata_details=array();
						$stockoutdata_details['stock_out_id']	= $lastInsertId;
						$stockoutdata_details['product_type']	= $params['product_category'][$key];
						$stockoutdata_details['product_name']		= $params['product_id'][$key];
						$stockoutdata_details['unit']				= $params['unit'][$key];
						$stockoutdata_details['brand']				= $params['brand'][$key];
						$stockoutdata_details['quantity']				= $params['quantity'][$key];
						$this->dbAdapter->insert('tbl_stock_out_details', $stockoutdata_details);
					//----Update product inventory-----//
						$quantityUpdationData = array();
						$quantityUpdationData['quantity']     = $stockQuantityUpdationRowIdResutl['quantity'] - $params['quantity'][$key];
						$quantityUpdationData['updated_at'] = date('Y-m-d H:i:s');		
						$where['id=?'] = $stockQuantityUpdationRowIdResutl['id'];
						$this->dbAdapter->update('tbl_inventory', $quantityUpdationData, $where);
					}
				}
				$this->_flashMessenger->addMessage('Stock out has been updated successfully.');
				$this->_redirect('/material-stock/material-stock-out/');
			}}catch(Exception $e){
				echo $e->getMessage();
				exit;
			}


		}

		public function getProductsByProductCategoryAction()
		{
			try{
				$response = array();
				$params = $this->getRequest()->getParams();
				$productListQuery = $this->dbAdapter->select()->from('tbl_products', array('*'))->where('product_type_id = ?', $params['product_type_id']);
				$productListResult = $this->dbAdapter->fetchAll($productListQuery);
				$products = '<option value="">Select Product</option>';
				foreach ($productListResult as $productList) {
					$products .= '<option value="'.$productList['id'].'">'.$productList['product_name'].'('.$productList['price'].')</option>';
				}
				$response['flag'] = true;
				$response['data'] = $products;
			} catch(Exception $e){
				$response['flag'] = false;
				$response['message'] = $e->getMessage();
			}
			echo json_encode($products);
			exit;
		}
		public function getSiteNameFromPoNoAction()
		{
			try{
				$response = array();
				$params = $this->getRequest()->getParams();
				$siteListQuery = "SELECT * from tbl_po_sites where po_no = '".$params['po_no']."'";
				$this->view->site_id_list = $site_id_list = $this->dbAdapter->fetchAll($siteListQuery);
				$sites = '<option value="">Select Site List</option>';
				foreach ($site_id_list as $sitelist ) {
					$sites .='<option value ="'.$sitelist['id'].'">'.$sitelist['site_id'].'</option>';
				}
				$response['flag'] = true;
				$response['data'] = $sites;
			}catch(Exception $e){
				$response['flag'] = false;
				$response['message'] = $e->getMessage();
			}
			echo json_encode($response);
			exit();
		}


		public function getTotalQuantityFromProductAction(){
			try{
				$response = array();
				$params = $this->getRequest()->getParams();

				
				$totalQuantityQuery ="SELECT total_quantity FROM `tbl_stock_details` WHERE product_type='".$params['product_type']."' and product_name='".$params['product_id']."' ORDER by id DESC LIMIT 1";
				
				$totalQuantityResult = $this->dbAdapter->fetchRow($totalQuantityQuery);
				

				$response['flag'] = true;
				$response['total_quantity'] = $totalQuantityResult['total_quantity'];
			} catch(Exception $e){
				$response['flag'] = false;
				$response['message'] = $e->getMessage();
			}
			echo json_encode($response);
			exit;
		}




		public function getProductUnitAndQuantityByProductIdAction(){
			try{
				$response = array();
				$params = $this->getRequest()->getParams();
				$productUnitQuery = $this->dbAdapter->select()->from('tbl_products', array('unit'))->where('id=?',$params['productId']);
				$productUnitResult = $this->dbAdapter->fetchRow($productUnitQuery);
				$productTotalQuantityQuery = $this->dbAdapter->select()
				->from('tbl_inventory',array('quantity'))
				->where('product_type_id=?',$params['productTypeId'])
				->where('product_id=?',$params['productId']);
				$productTotalQuantityResult = $this->dbAdapter->fetchRow($productTotalQuantityQuery);
				$response['flag'] = true;
				$response['unit'] = $productUnitResult['unit'];
				$response['total_quantity'] = $productTotalQuantityResult['quantity'];
			} catch(Exception $e){
				$response['flag'] = false;
				$response['message'] = $e->getMessage();
			}
			echo json_encode($response);
			exit;
		}

		public function dateConverter($date)
		{
			$date1 = str_replace('/', '-', $date);
			$date2 = new DateTime($date1);
			$date3 = $date2->format('Y-m-d');
			return $date3;
		}
		public function checklogin(){   
			$auth           = Zend_Auth::getInstance(); 
			$errorMessage   = ""; 
			/*************** check user identity ************/
			if(!$auth->hasIdentity()){
				$this->_redirect('/admin/index');  
			}   
		}

		public function siteDocumentAction()
		{
			try {
				$this->checklogin();   
				$this->view->messages = $messages = $this->_flashMessenger->getMessages();
				$siteDocumentMasterListQuery = $this->dbAdapter->select()
				->from("tbl_site_document", array("id","document_name"))
				->where("status = 1");
				$this->view->siteDocumentMasterList = $siteDocumentMasterListtResult = $this->dbAdapter->fetchAll($siteDocumentMasterListQuery);
			} catch(Exception $e){
				echo $e->getMessage();
				exit;
			}
		}
		public function addSiteDocumentAction(){
			try {
				$this->checklogin(); 
				$is_required = array();
				$params = $this->getRequest()->getParams();
		// echo '<pre>';print_r($params);exit;

				if($this->getRequest()->isPost()) {
					$insertData  = array(); 
					$insertData['id'] = $params['id'];                                        
					$insertData['document_name'] = trim(ucwords(strtolower($params['document_name'])));
					$insertData['is_required'] = isset($params['is_required']) && $params['is_required'] == "on" ? 1: 0;

// $insertData['created_at'] = date('Y-m-d H:i:s');                                   
					$this->dbAdapter->insert('tbl_site_document', $insertData);
					$this->_flashMessenger->addMessage(array("success"=>"Site Document has been saved successfully."));
					$this->_redirect('/master/site-document');
				}
			} catch(Exception $e){
				echo $e->getMessage();
				exit;
			}
		}




		public function getSiteDocumentAction()
		{
			try {
				$this->checklogin();
				$params = $this->getRequest()->getParams();
				$sitedocumentQuery = $this->dbAdapter->select()
				->from("tbl_site_document", array("id","document_name"))
				->where("id = ?", $params['site_id']);
				$this->view->siteDocumentDetails = $siteDocumentResult = $this->dbAdapter->fetchRow($sitedocumentQuery);
				$this->_helper->layout()->disableLayout();
			} catch(Exception $e){
				echo $e->getMessage();
				exit;
			}
		}


		public function deleteSiteDocumentAction(){
			try {
				$response = array();
				$this->checklogin();
				$this->view->messages = $messages = $this->_flashMessenger->getMessages();

				$requestParams = $this->getRequest()->getParams();
				if($requestParams['id']!=''){
					$Data['status']    = '0';
					$where = array();
					$where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['id']);
					$this->dbAdapter->update('tbl_site_document', $Data, $where);

				}
				$this->_helper->viewRenderer->setNoRender(true);
				$this->_helper->layout()->disableLayout(); 
			} catch(Exception $e){
				$response['flag'] = false;
				$response['message'] = $e->getMessage();
			}
			echo json_encode($response);
			exit;
		}	

	} 

	?>