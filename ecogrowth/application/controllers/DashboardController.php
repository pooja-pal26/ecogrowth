<?php
/**
* Logimetrix Techsolution Pvt. Ltd.
 * File Name   : DashboardController.php
 * File Description  : Dashboard Controller
 * Created By : Ajay Kumar
 * Created Date: 26 DEC 2016
 */
	 
class DashboardController extends Zend_Controller_Action
{
   var $dbAdapter;
	
    public function init()
    {
        /* Initialize action controller here */
        $this->_flashMessenger 	= $this->_helper->getHelper('FlashMessenger');
        $this->initView();
        $bootstrap 				= $this->getInvokeArg('bootstrap');
        $aConfig 				= $bootstrap->getOptions();
        $this->view->siteurl 	= $aConfig['site']['image']['url'];
        $this->dbAdapter 		= Zend_Db_Table::getDefaultAdapter(); 
        $auth 					= Zend_Auth::getInstance();
        $authStorage 			= $auth->getStorage();
        $auth                = Zend_Auth::getInstance();
        $authStorage         = $auth->getStorage();
        $this->id           = $authStorage->read()->id;
        $this->Role          = $authStorage->read()->Role;
    }

	
	
    public function indexAction(){
         $this->checklogin(); 
         $this->view->messages 	= $this->_flashMessenger->getMessages();
         $home = new Application_Model_Home();  
         $Uploadsdata = new Application_Model_Upload();
         $this->view->projectdata = $projectdata = $Uploadsdata->getAllProject($this->Role, $this->id);
         $this->view->lineList = $lineList = $Uploadsdata->getAllline($projectdata[0]['id'], $this->Role, $this->id);
         $this->view->packageList = $packageList = $Uploadsdata->getAllpackage($lineList[0]['id'], $this->Role, $this->id);

         $this->view->getScurveData = $getScurveData = $home->getScurveGraphsData($projectdata[0]['field_id'], $lineList[0]['field_id'], '', '');
         //$this->view->getScurveMonthlyGraphData = $getScurveMonthlyGraphData = $home->getScurveMonthlyGraphData($projectdata[0]['field_id'], $lineList[0]['field_id'], '', '');
        
    }

    public function getScurveDataAction(){
         $this->checklogin();
         $this->db  = Zend_Db_Table::getDefaultAdapter();
         $params    = $this->view->params = $this->getRequest()->getParams();
         $home      = new Application_Model_Home();  
         $this->view->getScurveData = $getScurveData = $home->getScurveGraphsData($params['project'], $params['line'], $params['package'], $params['activity']);
         //$this->view->getScurveMonthlyGraphData = $getScurveMonthlyGraphData = $home->getScurveMonthlyGraphData($params['project'], $params['line'], $params['package'], $params['activity']);
         if($params['activity']){
         	$this->view->activity = $params['activity'];
         }else{
         	$this->view->activity = 'Overall';
         }
         
         if($params['package']){
            $sqlQuery = $this->db->select() ->from('pmms_l2_plan',array('*')) 
            ->where('project_id =?',$params['project'])->where('line_id =?',$params['line'])->where('package_id =?',$params['package']);
          }else{
            $sqlQuery = $this->db->select() ->from('pmms_l2_plan',array('*')) 
            ->where('project_id =?',$params['project'])->where('line_id =?',$params['line']);
          }
          $this->view->planData = $planData = $this->db->fetchRow($sqlQuery);

         // echo '<pre>';
         // print_r($getScurveData);
         // exit();
         $this->_helper->layout()->disableLayout(); 
     }
    public function checklogin(){   
            $auth 			= Zend_Auth::getInstance(); 
            $errorMessage 	= ""; 
            /*************** check user identity ************/
            if(!$auth->hasIdentity()){
                  $this->_redirect('/admin/index');  
            }   
    } 
	
	
}
