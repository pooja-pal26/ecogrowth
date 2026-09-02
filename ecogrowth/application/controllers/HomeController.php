<?php
/**
* Logimetrix Techsolution Pvt. Ltd.
 * File Name   : HomeController.php
 * File Description  : Home Controller
 * Created By : Ajay Kumar
 * Created Date: 26 May 2016
 */

class HomeController extends Zend_Controller_Action
{
	var $dbAdapter;
	
	public function init()
	{
		/* Initialize action controller here */
		$this->_flashMessenger  = $this->_helper->getHelper('FlashMessenger');
		$this->initView();
		$bootstrap        = $this->getInvokeArg('bootstrap');
		$aConfig        = $bootstrap->getOptions();
		$this->view->siteurl  = $aConfig['site']['image']['url'];
		$this->view->duration   = $aConfig['pending']['days']['duration'];
		$this->dbAdapter    = Zend_Db_Table::getDefaultAdapter(); 
		$auth                   = Zend_Auth::getInstance();
		$authStorage           = $auth->getStorage();
		$this->id              = $authStorage->read()->id;
		$this->role            = $authStorage->read()->role;
	}
	
	public function logoutAction() {
        
        $cookie= $this->getRequest()->getCookie();
        if (!empty($this->getRequest()->getCookie('PHPSESSID'))) {
            setcookie('PHPSESSID', '', -time() + 3600, '/');
        }
        $this->_redirect('/index');
        
    }

	/*** indexAction() method is used to get task data */
	public function indexAction()
	{
		try {
			$this->checklogin(); 
			$this->view->messages = $this->_flashMessenger->getMessages();
			$db =Zend_Db_Table::getDefaultAdapter(); 
			$dbAdapter = $this->dbAdapter;
			$auth = Zend_Auth::getInstance(); 
			$authStorage = $auth->getStorage();    
			$params = $this->getRequest()->getParams();     
// 			print_r($params);
// 			exit();
			$user = new Application_Model_User(); 
			$this->view->role =		$this->role ;
			$this->view->month = date('m');
			$this->view->getTotalSite = $getTotalSite = $user->getTotalSite($params['from_date'],$params['to_date'],$params['site_type']);
//          $this->view->getTotalSite = $getTotalSite = $user->getTotalSite();
			$this->view->getTotalAllocatedSite = $getTotalAllocatedSite = $user->getTotalAllocatedSite($params['from_date'],$params['to_date'],$params['site_type']);
// 			$this->view->getTotalAllocatedSite = $getTotalAllocatedSite = $user->getTotalAllocatedSite();
			$this->view->getpendingSite = $getpendingSite = $user->getpendingSite($params['from_date'],$params['to_date'],$params['site_type']);
// 			$this->view->getpendingSite = $getpendingSite = $user->getpendingSite();
			$this->view->getcompletedSite = $getcompletedSite = $user->getcompletedSite($params['from_date'],$params['to_date'],$params['site_type']);
// 			$this->view->getcompletedSite = $getcompletedSite = $user->getcompletedSite();
			$this->view->getmaterialData= $getmaterialData = $user->getMaterialData($params['from_date'],$params['to_date'],$params['site_type']);
// 			$this->view->getmaterialData= $getmaterialData = $user->getMaterialData();
			$current_date = date('Y-m-d');
			$last_7_date = date('Y-m-d',strtotime('-7 days'));
			$stock_in_query = " select tsid.*,ts.supplier_name ,tpt.product_type_name,tmb.brand_name,tp.product_name
			from tbl_stock_in tsi 
			inner join tbl_stock_in_details tsid ON tsi.id = tsid.stock_in_id 
			inner join tbl_product_type tpt ON tpt.id = tsid.product_type 
			inner join tbl_material_brand tmb ON tmb.id = tsid.brand_name 
			inner join tbl_products tp ON tp.id = tsid.product_name
			inner join tbl_material_supplier ts ON ts.id = tsi.supplier_id
			ORDER BY stock_in_date DESC LIMIT 10";
			$this->view->stock_in_details =$stock_in_details = $this->dbAdapter->fetchAll($stock_in_query);
			$stock_out_query = " select tsi.*,tsid.*,tpt.product_type_name,tmb.brand_name,tp.product_name from tbl_stock_out tsi 
			inner join tbl_stock_out_details tsid ON tsi.id = tsid.stock_out_id 
			inner join tbl_product_type tpt ON tpt.id = tsid.product_type 
			inner join tbl_material_brand tmb ON tmb.id = tsid.brand
			inner join tbl_products tp ON tp.id = tsid.product_name
			ORDER BY stock_out_date DESC LIMIT 10";
			$this->view->stock_out_details = $stock_out_details = $this->dbAdapter->fetchAll($stock_out_query);
			$po_sites_query = "Select tps.*,tpd.*,tcm.client_name from tbl_po_details tpd 
			inner join tbl_po_sites tps ON tpd.po_no = tpd.po_no 
			inner join tbl_client_master tcm ON tcm.id = tpd.client_id
			Order BY tps.created_at DESC LIMIT 10";
			$this->view->po_sites_data = $po_sites_data = $this->dbAdapter->fetchAll($po_sites_query);
			$officeExpensesDetailsQuery = $this->dbAdapter->select()
			->from("tbl_office_expense as toe", array("*"))
			->joinLeft("tbl_user as tu","tu.id = toe.transfered_to", array("tu.name as payee"))
			->joinLeft("tbl_companies as c","c.id = toe.company_id", array("c.name as company"))
			->joinLeft("tbl_payment_modes","tbl_payment_modes.id = toe.payment_mode_id", array("payment_mode"))
			->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = toe.bank_account_id", array("bank_name","bank_account_number"))
			->where('toe.is_deleted = 0')
			->order("toe.transfer_date desc")->limit(10);
			$this->view->officeExpense =$officeExpense = $this->dbAdapter->fetchAll($officeExpensesDetailsQuery);
			$siteExpenseQuery =$this->dbAdapter->select()
			->from("tbl_site_expense as toe", array("*"))
			->joinLeft("tbl_companies as c","c.id = toe.company_id", array("c.name as company"))
			->joinLeft("tbl_payment_modes","tbl_payment_modes.id = toe.payment_mode_id", array("payment_mode"))
			->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = toe.bank_account_id", array("bank_name","bank_account_number"))
			->order("toe.transfer_date desc")->limit(10);
			$this->view->siteExpense = $siteExpense = $this->dbAdapter->fetchAll($siteExpenseQuery);
			$invoiceReportQuery = $this->dbAdapter->select()
			->from('tbl_punched_invoice_details as tid', array('*'))
			->joinLeft('tbl_client_master as tcm','tcm.id = tid.client_id', array('client_name'))
			->joinLeft('tbl_states as ts','ts.id = tid.state_for_id', array('state_name'))
			->joinLeft('tbl_company_vendor_master as tcvm','tcvm.id = tid.company_vendor_id', array('vendor_company_name'))
			->where('tid.status = 1')->order('tid.invoice_date desc')->limit(10);
			$this->view->invoiceReports = $invoiceReportResult = $this->dbAdapter->fetchAll($invoiceReportQuery);
			$allocatedSiteQuery = $this->dbAdapter->select()
			->from("tbl_site_allocation", array("id","po_no","po_date","site_id","due_date"))
			->where("status = 1");
			$this->view->allocatedSites = $allocatedSiteResult = $this->dbAdapter->fetchAll($allocatedSiteQuery);
			if (isset($params['date'])) {
				$this->view->getTaskMontlyRecord = $getTaskMontlyRecord = $user->getTaskMontlyRecord($params['date']);
			}

			$months = array('01'=>'JAN','02'=>'FEB','03'=>'MAR','04'=>'APR','05'=>'MAY','06'=>'JUN','07'=>'JUL','08'=>'AUG','09'=>'SEP','10'=>'OCT','11'=>'NOV','12'=>'DEC');
			$year = date('Y');
			if(date('m') == "01"){
				$year = (date('Y')-1);
			}

			$yearlySiteExpense = array();
			foreach ($months as $key => $value) {
				$site_expense_query = "select sum(amount) as total from tbl_site_expense where transfer_date like '%".$year.'-'.$key."%'";
				$site_expense_result = $this->dbAdapter->fetchRow($site_expense_query);
				if($site_expense_result && $site_expense_result['total'] > 0){
					array_push($yearlySiteExpense, array($value,$site_expense_result['total']));
				}else{
					array_push($yearlySiteExpense, array($value,0));
				}
			}
			$this->view->yearlySiteExpense = $yearlySiteExpense;

			$months = array(
                '01'=>'JAN','02'=>'FEB','03'=>'MAR','04'=>'APR',
                '05'=>'MAY','06'=>'JUN','07'=>'JUL','08'=>'AUG',
                '09'=>'SEP','10'=>'OCT','11'=>'NOV','12'=>'DEC'
            );
            
            $monthss = [];
            
            for ($i = 0; $i < 6; $i++) 
            {
                $monthss[] = date("Y-m", strtotime(date('Y-m-01') . " -$i months"));
            }
            
             
			$year = date('Y');
			if(date('m') == "01"){
				$year = (date('Y')-1);
			}

			$yearlyOfficeExpense = array();
			foreach ($monthss as $key => $value) {
				$office_expense_query = "select sum(amount) as total from tbl_office_expense where is_deleted = 0 and transfer_date like '%".$value."%'";
				$office_expense_result = $this->dbAdapter->fetchRow($office_expense_query);
				if($office_expense_result && $office_expense_result['total'] > 0){
					array_push($yearlyOfficeExpense, array($value,$office_expense_result['total']));
				}else{
					array_push($yearlyOfficeExpense, array($value,0));
				}
			}
			$this->view->yearlyOfficeExpense = $yearlyOfficeExpense;
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
	}
	
	 public function getSitesByPoNumberForAllocationAction()
            {
            	try{
            		$response = array();
            		$params = $this->getRequest()->getParams();
            		if ($this->getRequest()->isPost()) {
            			$sitesQuery = $this->dbAdapter->select()
            			->from("tbl_site_allocation", array("site_id"))
            			->where("po_no like ?", $params['po_number'])
            			->where("status = 1");
            			$sitesResult = $this->dbAdapter->fetchAll($sitesQuery);
            			
            			if ($sitesResult) {
            				$response['flag'] = true;
            				$response['sites'] = $sitesResult;
            			} else {
            				$response['flag'] = flase;
            				$response['message'] = "No Sites Found";
            			}
            		} else {
            			$response['flag'] = false;
            			$response['message'] = "Invalid Request !";
            		}
            	} catch(Exception $e){
            		$response['flag'] = false;
            		$response['message'] = $e->getMessage();
            	}
            	echo json_encode($response);
            	exit;
            }


public function getDataInvoiceAction()
{
    try {
        $this->checklogin();
        $params = $this->getRequest()->getParams();

        $InvoiceData = array();

        if (!empty($params['month']) && !empty($params['year'])) {

            $year  = $params['year'];
            $month = $params['month'];

            $amount_query = "
                SELECT 
                    tc.client_name,
                    ts.state_name,
                    SUM(tp.invoice_value) AS total
                FROM tbl_punched_invoice_details tp
                LEFT JOIN tbl_client_master tc ON tp.client_id = tc.id
                LEFT JOIN tbl_states ts ON ts.id = tc.state_id
                WHERE tp.status = 1
                AND tp.invoice_date LIKE '%$year-$month%'
                GROUP BY tc.client_name, ts.state_name
            ";

            $amount_data = $this->dbAdapter->fetchAll($amount_query);

            if (!empty($amount_data)) {
                foreach ($amount_data as $amount) {

                    // Client name ka first word
                    $client_name = explode(' ', $amount['client_name']);

                    $InvoiceData[] = array(
                        $client_name[0],
                        $amount['state_name'],
                        (float) $amount['total']
                    );
                }
            } else {
                $InvoiceData[] = array('No Data', '', 0);
            }

            $this->view->InvoiceData = $InvoiceData;
            $this->view->month = $month;
            $this->view->year  = $year;
        }

        $this->_helper->layout()->disableLayout();

    } catch (Exception $e) {
        echo $e->getMessage();
        exit;
    }
}


	public function getDataPoAction()
{
    try {
        $this->checklogin();
        $params = $this->getRequest()->getParams();

        $Po_Data = array();

        if (!empty($params['month']) && !empty($params['year'])) {

            $year  = $params['year'];
            $month = $params['month'];

            $amount_query = "
                SELECT 
                    tc.client_name,
                    ts.state_name,
                    SUM(tp.po_amount) AS total
                FROM tbl_po_details tp
                LEFT JOIN tbl_client_master tc ON tp.client_id = tc.id
                LEFT JOIN tbl_states ts ON ts.id = tc.state_id
                WHERE tp.order_date LIKE '%$year-$month%'
                GROUP BY tc.client_name, ts.state_name
            ";

            $amount_data = $this->dbAdapter->fetchAll($amount_query);

            if (!empty($amount_data)) {
                foreach ($amount_data as $amount) {
                    $Po_Data[] = array(
                        $amount['client_name'],
                        $amount['state_name'],
                        (float) $amount['total']
                    );
                }
            } else {
                $Po_Data[] = array('No Data', '', 0);
            }

            $this->view->month = $month;
            $this->view->year  = $year;
        }

        $this->view->Po_Data = $Po_Data;
        $this->_helper->layout()->disableLayout();

    } catch (Exception $e) {
        echo $e->getMessage();
        exit;
    }
}

	
	public function getDataPoSiteAction(){
		try{
			$this->checklogin();
			$dbAdapter = $this->dbAdapter;
			$params = $this->getRequest()->getParams();
			$Po_Data = array();
//          print_r($params);
// 			exit;
			if (isset($params['poNumber']) && isset($params['siteId'])) {
    			$punchedInvoiceDetailsQuery = "Select sum(invoice_value) as total,sum(received_amount) as total_received_amount from tbl_punched_invoice_details WHERE  po_no = TRIM('".$params['poNumber']."') and site_id = TRIM('".$params['siteId']."') and status=1";
				$punchedInvoiceDetails = $this->dbAdapter->fetchRow($punchedInvoiceDetailsQuery);
				$siteExpenseQuery = "Select sum(amount) as expense_amount from tbl_site_expense WHERE  po_no = '".$params['poNumber']."' and site_id = '".$params['siteId']."' and status=1";
				$siteExpenseDetails = $this->dbAdapter->fetchRow($siteExpenseQuery);
				$plData=$punchedInvoiceDetails['total']-$siteExpenseDetails['expense_amount'];
			}

			$this->view->poNumber = $params['poNumber'];
			$this->view->siteId = $params['siteId'];
			$this->view->PlData = $plData;
			$this->view->PiData = $punchedInvoiceDetails;
			$this->view->seData = $siteExpenseDetails;
			$this->_helper->layout()->disableLayout();

		}catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
	}
	public function siteLocationAction(){
		$this->checklogin();
		$params = $this->getRequest()->getParams();    

		$sql_site_details = "select site_id, infratel_id, tech_name, tech_mobile from tbl_site_allocation where 1";
		$site_details = $this->dbAdapter->fetchAll($sql_site_details);

		$site_array = array();
		foreach ($site_details as $value) {
			$sql_site = "select * from tbl_location_mapping where infratel_site_id='".$value['infratel_id']."'";
			$site = $this->dbAdapter->fetchRow($sql_site); 
			if($site['latitude']!=''){
				$site_data = array('infratel_site_id'=>$value['infratel_id'], 'site_id'=>$value['site_id'], 'tech_name'=>$value['tech_name'], 'tech_mobile'=>$value['tech_mobile'], 'latitude'=>$site['latitude'], 'longitude'=>$site['longitude'], 'site_id'=>$site['longitude']);
				array_push($site_array, $site_data);
			}
		} 
		$this->view->site_list = $site_array;
           // echo '<pre>';
           // print_r($site_array);
           // exit();
       // $this->_helper->layout()->disableLayout();
	}

	public function getTotalsiteAction(){
		$this->checklogin();
        //echo "helsf";exit;
		$this->db = Zend_Db_Table::getDefaultAdapter();
        //$this->view->messages  = $this->_flashMessenger->getMessages();  
		$this->view->$params = $params = $this->getRequest()->getParams();  
		$this->_helper->layout()->disableLayout(); 
		$query = "select * from tbl_deployment where status = 1";
		$this->view->site_list = $site_list = $this->dbAdapter->fetchAll($query);
           // echo '<pre>';
           // print_r($site_list);
           // exit();
		$this->_helper->layout()->disableLayout();
	}

	public function allocatedSiteAction(){
		$this->checklogin();
        //echo "helsf";exit;
		$this->db              = Zend_Db_Table::getDefaultAdapter();
        //$this->view->messages  = $this->_flashMessenger->getMessages();  
		$this->view->$params = $params = $this->getRequest()->getParams();  

		$query = "select s.*, u.name as allocated_to, b.name as allocated_by, sup.name as supervisor, v.vendor_name as vendor, st.name as status_name from tbl_site_allocation as s 
		left join tbl_user as u on (s.allocated_to_userid = u.id) 
		left join tbl_user as b on (s.allocated_by_userid = b.id) 
		left join tbl_user as sup on (s.supervisor_id = sup.id) 
		left join tbl_vendor as v on (s.allocated_to_userid = v.id) 
		left join tbl_site_status as st on (s.status = st.status) order by id desc";
		$this->view->allocated_site_list = $allocated_site_list = $this->dbAdapter->fetchAll($query);
  // echo '<pre>';
  // print_r($allocated_site_list);
  // exit();
		$this->_helper->layout()->disableLayout();
	}

	public function pendingAllocationSiteAction(){
		$this->checklogin();
        //echo "helsf";exit;
		$this->db              = Zend_Db_Table::getDefaultAdapter();
        //$this->view->messages  = $this->_flashMessenger->getMessages();  
		$this->view->$params = $params = $this->getRequest()->getParams();  
		
		$query = "select  s.*, u.name as allocate_user, sup.name as supervisor, v.vendor_name as vendor, st.name as status_name  from  tbl_site_allocation as s 
		left join tbl_user as u on (s.allocate_userid = u.id)
		left join tbl_user as sup on (s.supervisor_id = sup.id)
		left join tbl_vendor as v on (s.allocate_userid = v.id)
		left join tbl_site_status as st on (s.status = st.status)
		where s.status = 0 ORDER BY s.created DESC";
		$this->view->pending_allocate_site_list = $pending_allocate_site_list = $this->dbAdapter->fetchAll($query);
           // echo '<pre>';
           // print_r($allocate_site_list);
           // exit();
		$this->_helper->layout()->disableLayout();
	}
	public function completedAllocationSiteAction(){
		$this->checklogin();
        //echo "helsf";exit;
		$this->db              = Zend_Db_Table::getDefaultAdapter();
        //$this->view->messages  = $this->_flashMessenger->getMessages();  
		$this->view->$params = $params = $this->getRequest()->getParams();  
		
		$query = "select  s.*, u.name as allocate_user, sup.name as supervisor, v.vendor_name as vendor, st.name as status_name  from  tbl_site_allocation as s 
		left join tbl_user as u on (s.allocate_userid = u.id)
		left join tbl_user as sup on (s.supervisor_id = sup.id)
		left join tbl_vendor as v on (s.allocate_userid = v.id)
		left join tbl_site_status as st on (s.status = st.status)
		where s.status = 1";
		$this->view->completed_allocate_site_list = $completed_allocate_site_list = $this->dbAdapter->fetchAll($query);
           // echo '<pre>';
           // print_r($completed_allocate_site_list);
           // exit();
		$this->_helper->layout()->disableLayout();
	}

	public function checklogin(){   
		$auth       = Zend_Auth::getInstance(); 
		$errorMessage   = ""; 
		/*************** check user identity ************/
		if(!$auth->hasIdentity()){
			$this->_redirect('/admin/index');  
		}   
	} 

	public function dailyUpdateDashboardAction(){
		try{
			$this->checklogin(); 
			$this->view->messages = $this->_flashMessenger->getMessages();
			$yearlySiteExpense =$yearlyOfficeExpense = array();
			$date = date('Y-m-d');
			$params = $this->getRequest()->getParams();
			if(isset($params['date']) && $params['date'] != ""){
				$dateArr = explode('/', $params['date']);
				$date = $dateArr[2].'-'.$dateArr[1].'-'.$dateArr[0];
			}
			$this->view->date = $date;
			$datetime = explode('-', $date);
			$site_expense_query = "select sum(amount) as total from tbl_site_expense where created_at like '%".$date."%'";
			$site_expense_result = $this->dbAdapter->fetchRow($site_expense_query);
			$office_expense_query = "select sum(amount) as total from tbl_office_expense where is_deleted = 0 and created_at like '%".$date."%'";
			$office_expense_result = $this->dbAdapter->fetchRow($office_expense_query);
			if($site_expense_result && $site_expense_result['total'] > 0){
				array_push($yearlySiteExpense, array($date,$site_expense_result['total'],$datetime[2]."-".$datetime[1]));
			}else{
				array_push($yearlySiteExpense, array($date,0,$datetime[2]."-".$datetime[1]));
			}

			if($office_expense_result && $office_expense_result['total'] > 0){
				array_push($yearlyOfficeExpense, array($date,$office_expense_result['total'],$datetime[2]."-".$datetime[1]));
			}else{
				array_push($yearlyOfficeExpense, array($date,0,$datetime[2]."-".$datetime[1]));
			}
			$officeExpensesDetailsQuery = $this->dbAdapter->select()
			->from("tbl_office_expense as toe", array("*"))
			->joinLeft("tbl_user as tu","tu.id = toe.transfered_to", array("tu.name as payee"))
			->joinLeft("tbl_companies as c","c.id = toe.company_id", array("c.name as company"))
			->joinLeft("tbl_payment_modes","tbl_payment_modes.id = toe.payment_mode_id", array("payment_mode"))
			->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = toe.bank_account_id", array("bank_name","bank_account_number"))
			->where('toe.is_deleted = 0')
			->where("date(toe.created_at)=?",$date);
			$this->view->officeExpense =$officeExpense = $this->dbAdapter->fetchAll($officeExpensesDetailsQuery);
			// echo "<pre>"; print_r($officeExpense);
			$siteExpenseQuery =$this->dbAdapter->select()
			->from("tbl_site_expense as toe", array("*"))
			->joinLeft("tbl_companies as c","c.id = toe.company_id", array("c.name as company"))
			->joinLeft("tbl_payment_modes","tbl_payment_modes.id = toe.payment_mode_id", array("payment_mode"))
			->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = toe.bank_account_id", array("bank_name","bank_account_number"))
			->where("date(toe.created_at) = ?",$date);
			$this->view->siteExpense = $siteExpense = $this->dbAdapter->fetchAll($siteExpenseQuery);
			$fundDataQuery =$this->dbAdapter->select()
			->from("tbl_fund_transfers as toe", array("*"))
			->joinLeft("tbl_companies as c","c.id = toe.company_id", array("c.name as company"))
			->joinLeft("tbl_payment_modes","tbl_payment_modes.id = toe.payment_mode_id", array("payment_mode"))
			->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = toe.bank_account_id", array("bank_name","bank_account_number"))
			->where("date(toe.created_at) = ?",$date);
			$this->view->fundData= $fundData = $this->dbAdapter->fetchAll($fundDataQuery);
			$invoiceReportQuery = "Select tid.*,tcm.client_name,ts.state_name ,tcvm.vendor_company_name from tbl_punched_invoice_details tid 
			left join tbl_client_master tcm on tcm.id = tid.client_id 
			left join tbl_states ts on ts.id = tid.state_for_id
			left join  tbl_company_vendor_master tcvm on tcvm.id = tid.company_vendor_id 
			WHERE tid.status = 1 and tid.invoice_date LIKE '%".$date."%'";
			$this->view->invoiceReports = $invoiceReportResult = $this->dbAdapter->fetchAll($invoiceReportQuery);
			// echo "<pre>"; print_r($invoiceReportQuery);
			$stock_in_query = " select tsid.*,ts.supplier_name ,tpt.product_type_name,tmb.brand_name,tp.product_name,tsi.stock_in_date
			from tbl_stock_in tsi 
			inner join tbl_stock_in_details tsid ON tsi.id = tsid.stock_in_id 
			inner join tbl_product_type tpt ON tpt.id = tsid.product_type 
			inner join tbl_material_brand tmb ON tmb.id = tsid.brand_name 
			inner join tbl_products tp ON tp.id = tsid.product_name
			inner join tbl_material_supplier ts ON ts.id = tsi.supplier_id
			Where tsi.stock_in_date LIKE '%".$date."%'";
			$this->view->stock_in_details =$stock_in_details = $this->dbAdapter->fetchAll($stock_in_query);
			// echo "<pre>"; print_r($stock_in_details);
			$stock_out_query = " select tsi.*,tsid.*,tpt.product_type_name,tmb.brand_name,tp.product_name from tbl_stock_out tsi 
			inner join tbl_stock_out_details tsid ON tsi.id = tsid.stock_out_id 
			inner join tbl_product_type tpt ON tpt.id = tsid.product_type 
			inner join tbl_material_brand tmb ON tmb.id = tsid.brand
			inner join tbl_products tp ON tp.id = tsid.product_name
			Where stock_out_date  LIKE '%".$date."%'";
			$this->view->stock_out_details = $stock_out_details = $this->dbAdapter->fetchAll($stock_out_query);
			// echo "<pre>"; print_r($stock_out_details);
			$po_sites_query = "Select tps.*,tpd.*,tcm.client_name from tbl_po_details tpd 
			inner join tbl_po_sites tps ON tpd.po_no = tpd.po_no 
			inner join tbl_client_master tcm ON tcm.id = tpd.client_id
			Where  tpd.created_at  LIKE '%".$date."%'";
			$this->view->po_sites_data = $po_sites_data = $this->dbAdapter->fetchAll($po_sites_query);
			// echo "<pre>"; print_r($po_sites_query);

			$this->view->yearlySiteExpense = $yearlySiteExpense;
			$this->view->yearlyOfficeExpense = $yearlyOfficeExpense;
			// echo '<pre>';
			// print_r($po_sites_data);
			// print_r($officeExpense);
			// print_r($siteExpense);
			// print_r($stock_in_query);
			// print_r($stock_out_query);
			// print_r($po_sites_query);
			// exit;
		}catch(Exception $e){
			echo  $e->getMessage();exit;
		}

		// exit;

	}
}