<?php
/**
 * Logimetrix Techsolution Pvt. Ltd.
 * File Name   : ExpenseController.php
 * File Description  : Expense Controller
 * Created By : Vinod Bisht
 * Created Date: 07 March 2018
 */
class CompanyController extends Zend_Controller_Action {
	public function init(){
		/* Initialize action controller here */
		$this->_flashMessenger  = $this->_helper->getHelper('FlashMessenger');
		$this->initView();
		$bootstrap              = $this->getInvokeArg('bootstrap');
		$aConfig                = $bootstrap->getOptions();
		$this->view->siteurl    = $aConfig['site']['image']['url'];
		$this->dbAdapter        = Zend_Db_Table::getDefaultAdapter(); 
		$auth                   = Zend_Auth::getInstance();
		$authStorage            = $auth->getStorage();
		$this->id               = $authStorage->read()->id;
		$this->role             = $authStorage->read()->role;
		$this->role_type        = $authStorage->read()->role_type;
		$this->access_token     = $authStorage->read()->access_token;
	}
	public function companyDetailsAction(){
		$this->checklogin(); 
		$this->view->params = $params = $this->getRequest()->getParams();
		$this->view->messages   = $this->_flashMessenger->getMessages();
		$query ="Select * from tbl_companies";
		$companies = $this->dbAdapter->fetchAll($query);
		$this->view->companies = $companies;
		// echo '<pre>';print_r($companies);exit;
	}

	public function addCompanyAction(){
		try{
			$this->checklogin();
			$this->view->params = $params = $this->getRequest()->getParams();
			$db = $this->db = Zend_Db_Table::getDefaultAdapter();
			if($params['id']){
				$this->view->params = $params = $this->getRequest()->getParams();
				$query = "Select * from tbl_companies where id =".$params['id'];
				$result = $db->fetchRow($query);
				$this->view->companies = $result;
				if($this->getRequest()->isPost()){
					$companyData=array();
					$companyData['name']=$params['name'];
					$companyData['address']=$params['address'];
					$companyData['email']=$params['email'];
					$companyData['mobile_number']=$params['mobile_number'];
					$companyData['company_alias']=$params['company_alias'];
				// echo "<pre>";print_r($companyData);exit;
					$this->dbAdapter->update('tbl_companies',$companyData,array('id=?'=>$params['id']));
					$this->_redirect('/company/company-details');
				}
			}else{
				if($this->getRequest()->isPost()){
					$companyData=array();
					$companyData['name']=$params['name'];
					$companyData['address']=$params['address'];
					$companyData['email']=$params['email'];
					$companyData['mobile_number']=$params['mobile_number'];
					$companyData['company_alias']=$params['company_alias'];
					// echo "<pre>";print_r($companyData);exit;
					$this->dbAdapter->insert('tbl_companies',$companyData);
					$this->_flashMessenger->addMessage('Added Successfully');
					$this->_redirect('/company/company-details');
				}
			}
			$layout = $this->_helper->layout();
			$layout->disableLayout('');
			// $this->_redirect('/company/company-details');
		} 
		catch(Exception $e){
			echo $e->getMessage();exit;
		}
// echo '<pre>';print_r($holidays);exit;
	}

// 	public function deleteCompanyAction(){
// 		$this->checklogin();
// 		$this->view->params = $params = $this->getRequest()->getParams();
// 		$db = $this->db = Zend_Db_Table::getDefaultAdapter();
// 		try{
// 			$this->view->params = $params = $this->getRequest()->getParams();

// 			$query = "Delete from tbl_companies where id =".$params['id'];
// 			$result = $db->query($query);
// 			$this->_redirect('/company/company-details'); 
// 		} 
// 		catch(Exception $e){
// 			echo $e->getMessage();exit;
// 		}
// // echo '<pre>';print_r($holidays);exit;
// 	}

	public function deleteCompanyAction(){
		try {
			$response = array();
			$this->checklogin();
			$requestParams = $this->getRequest()->getParams();
			$db = $this->db = Zend_Db_Table::getDefaultAdapter();
			if($requestParams['id']!=''){
				$query = "Delete from tbl_companies where id =".$requestParams['id'];
				// echo '<pre>';print_r($query);exit;

				$result = $db->query($query);
				$response['flag'] = true;
				$response['message'] = "Company has been deleted successfully.";
			} else {
				$response['flag'] = false;
				$response['message'] = "Company ID is missing. Please try again.";
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
	public function checklogin(){   
		$auth           = Zend_Auth::getInstance(); 
		$errorMessage   = ""; 
		/*************** check user identity ************/
		if(!$auth->hasIdentity()){
			$this->_redirect('/admin/index');  
		}   
	} 
}