<?php
/**
* Logimetrix Techsolution Pvt. Ltd.
 * File Name   : MapController.php
 * File Description  : fee Controller
 * Created By : Raghvendra
 * Created Date: 07 Feb 2019
 */

class SitemapController extends Zend_Controller_Action{
	var $dbAdapter;

	public function init(){
		$this->_flashMessenger 	= $this->_helper->getHelper('FlashMessenger');
		$this->initView();
		$bootstrap 				= $this->getInvokeArg('bootstrap');
		$aConfig 				= $bootstrap->getOptions();
		$this->view->siteurl 	= $aConfig['site']['image']['url'];
		$this->dbAdapter 		= Zend_Db_Table::getDefaultAdapter(); 
		$auth                   = Zend_Auth::getInstance();
		$authStorage           = $auth->getStorage();
		$this->WebLoginID      = $authStorage->read()->WebLoginID;
		$this->id              = $authStorage->read()->id;
		$this->role            = $authStorage->read()->role;
	}

	public function indexAction(){
		$sqlQuery = "select id, site_id, site_name,lat,lng from tbl_site_map" ;
		$result = $this->dbAdapter->fetchAll($sqlQuery);
		$students = array();
		foreach ($result as $student) {
			array_push($students, $student);
		}

		$this->view->students = $students;
		$this->getHelper('Layout')->disableLayout();
	}

}
