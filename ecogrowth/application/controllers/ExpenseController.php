<?php
/**
 * Logimetrix Techsolution Pvt. Ltd.
 * File Name   : ExpenseController.php
 * File Description  : Expense Controller
 * Created By : Vinod Bisht
 * Created Date: 07 March 2018
 */
class ExpenseController extends Zend_Controller_Action {
	var $dbAdapter;
	public function init() {
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
		$this->master_model 	= new Application_Model_Master();
		$user = new Application_Model_User();

	}
// 	public function indexAction(){
// 		try {
// 			$this->checklogin(); 
// 			$this->view->params = $params = $this->getRequest()->getParams();
// 			$this->view->messages   = $this->_flashMessenger->getMessages();
// 			$siteDetails = array();
// 			$totalExpenseAmountQuery = $this->dbAdapter->select()
// 			->from("tbl_site_expense", array('sum(amount) as total_amount'))
// 			->order("transfer_date desc");
			
// 			if(isset($params['from_date']) && $params['from_date'] != "" && isset($params['to_date']) && $params['to_date'] != ""){
// 				$totalExpenseAmountQuery->where("date(transfer_date) BETWEEN '".$this->dateConverter($params['from_date'])."'  AND '".$this->dateConverter($params['to_date'])."'");
// 			} else if(isset($params['quarter']) && $params['quarter'] != "") {
// 			    $yearArr = explode('-', $params['quarter']);
// 			    $year = $yearArr[0];
// 			    $curr_month = date("m");
			   
// 			    if($params['quarter'] == 1) {
// 			        $start_date = $year.'-04-01';
// 			        $end_date = $year.'-06-30';
// 			    } else if($params['quarter'] == 2) {
// 			        $start_date = $year.'-07-01';
// 			        $end_date = $year.'-09-30';
// 			    } else if($params['quarter'] == 3) {
// 			        $start_date = $year.'-10-01';
// 			        $end_date = $year.'-12-31';
// 			    } else if($params['quarter'] == 4) {
// 			        $start_date = ($year+1).'-01-01';
// 			        $end_date = ($year+1).'-03-31';
// 			    }
			    
// 			    $totalExpenseAmountQuery->where("date(transfer_date) BETWEEN '".$start_date."'  AND '".$end_date."'");
// 			} else {
// 			     $curr_month = date("m");
// 			     $year = date("Y");
			     
// 			    if($curr_month > 3) {
// 			        $start_date = $year.'-04-01';
// 			        $end_date = $year.'-06-30';
// 			    } else if($curr_month > 6) {
// 			        $start_date = $year.'-07-01';
// 			        $end_date = $year.'-09-30';
// 			    } else if($curr_month > 9) {
// 			        $start_date = $year.'-10-01';
// 			        $end_date = $year.'-12-31';
// 			    } else {
// 			        $start_date = ($year+1).'-01-01';
// 			        $end_date = ($year+1).'-03-31';
// 			    }
			    
// 			    $totalExpenseAmountQuery->where("date(transfer_date) BETWEEN '".$start_date."'  AND '".$end_date."'");
// 			}
			
			
			
// 			$this->view->total_amount = $total_amount = $this->dbAdapter->fetchRow($totalExpenseAmountQuery);

// 			$siteDetailsQuery = $this->dbAdapter->select()
// 			->from("tbl_po_sites", array("id","po_no","site_id","site_name","order_date","status"))
// 			->where('is_deleted = ?', 0)
// 			->order("order_date desc");
// 			$siteDetailsResult = $this->dbAdapter->fetchAll($siteDetailsQuery);
// 			foreach ($siteDetailsResult as $poDetails) {
// 				$totalSiteExpenseQuery = $this->dbAdapter->select()
// 				->from("tbl_site_expense",array("sum(amount) as total_expense","transfer_date"))
// 				->where("site_id = ?",$poDetails['site_id'])
// 				->where("po_no = ?", $poDetails['po_no'])
// 				->where('status = 1');
// 				$lastTransferDateSiteExpenseQuery = $this->dbAdapter->select()
// 				->from("tbl_site_expense",array("transfer_date"))
// 				->where("site_id = ?",$poDetails['site_id'])
// 				->where("po_no = ?", $poDetails['po_no'])
// 				->order("transfer_date DESC")
// 				->where('status = 1');
// 				$lastAddedBySiteExpenseQuery = $this->dbAdapter->select()
// 				->from("tbl_site_expense",array("created_at","created_by"))
// 				->joinLeft("tbl_user","tbl_user.id = tbl_site_expense.created_by", array("name"))
// 				->where("site_id = ?",$poDetails['site_id'])
// 				->where("po_no = ?", $poDetails['po_no'])
// 				->order("tbl_site_expense.created_at DESC")
// 				->where('tbl_site_expense.status = 1');
// 				$totalSiteExpenseDetailsQuery = $this->dbAdapter->select()
// 				->from("tbl_site_expense",array())
// 				->joinLeft("tbl_site_expense_details","tbl_site_expense.id = tbl_site_expense_details.site_expense_id", array("sum(spent_amount) as balance_amount"))
// 				->where("tbl_site_expense.site_id = ?",$poDetails['site_id'])
// 				->where("tbl_site_expense.po_no = ?", $poDetails['po_no'])
// 				->where('tbl_site_expense.status = 1');

// 				if(isset($params['from_date']) && $params['from_date'] != "" && isset($params['to_date']) && $params['to_date'] != ""){
// 					$this->view->from_date = $params['from_date'];
// 					$this->view->to_date = $params['to_date'];
// 					$totalSiteExpenseQuery->where("date(transfer_date) BETWEEN '".$this->dateConverter($params['from_date'])."'  AND '".$this->dateConverter($params['to_date'])."'");
// 				} else if(isset($params['quarter']) && $params['quarter'] != "") {
//     			    $yearArr = explode('-', $params['quarter']);
//     			    $year = $yearArr[0];
//     			    $curr_month = date("m");
    			   
//     			    if($params['quarter'] == 1) {
//     			        $start_date = $year.'-04-01';
//     			        $end_date = $year.'-06-30';
//     			    } else if($params['quarter'] == 2) {
//     			        $start_date = $year.'-07-01';
//     			        $end_date = $year.'-09-30';
//     			    } else if($params['quarter'] == 3) {
//     			        $start_date = $year.'-10-01';
//     			        $end_date = $year.'-12-31';
//     			    } else if($params['quarter'] == 4) {
//     			        $start_date = ($year+1).'-01-01';
//     			        $end_date = ($year+1).'-03-31';
//     			    }
    			    
//     			    $totalSiteExpenseQuery->where("date(transfer_date) BETWEEN '".$start_date."'  AND '".$end_date."'");
//     			} 
//                 // 			else {
//                 // 			     $curr_month = date("m");
//                 // 			     $year = date("Y");
                			     
//                 // 			    if($curr_month > 3) {
//                 // 			        $start_date = $year.'-04-01';
//                 // 			        $end_date = $year.'-06-30';
//                 // 			    } else if($curr_month > 6) {
//                 // 			        $start_date = $year.'-07-01';
//                 // 			        $end_date = $year.'-09-30';
//                 // 			    } else if($curr_month > 9) {
//                 // 			        $start_date = $year.'-10-01';
//                 // 			        $end_date = $year.'-12-31';
//                 // 			    } else {
//                 // 			        $start_date = ($year+1).'-01-01';
//                 // 			        $end_date = ($year+1).'-03-31';
//                 // 			    }
                			    
//                 // 			    $totalSiteExpenseQuery->where("date(transfer_date) BETWEEN '".$start_date."'  AND '".$end_date."'");
//                 // 			}
// 				// echo $totalSiteExpenseQuery;
// 				// exit;
// 				$totalSiteExpenseResult = $this->dbAdapter->fetchRow($totalSiteExpenseQuery);
// 				$lastTransferDateSiteExpenseResult = $this->dbAdapter->fetchRow($lastTransferDateSiteExpenseQuery);
// 				$lastAddedBySiteExpenseResult = $this->dbAdapter->fetchRow($lastAddedBySiteExpenseQuery);
// 				$totalSiteExpenseDetailsResult = $this->dbAdapter->fetchRow($totalSiteExpenseDetailsQuery);
// 				$poDetails['total_expense'] = $totalSiteExpenseResult['total_expense'];
// 				// $poDetails['last_fund_transfer_date'] = $totalSiteExpenseResult['transfer_date'];
// 				$poDetails['last_fund_transfer_date'] = $lastTransferDateSiteExpenseResult['transfer_date'];
// 				$poDetails['last_expense_added_by'] = $lastAddedBySiteExpenseResult['name'];
// 				$poDetails['last_expense_added_date'] = $lastAddedBySiteExpenseResult['created_at'];
// 				$poDetails['balance_amount'] = $totalSiteExpenseDetailsResult['balance_amount'];
// 				array_push($siteDetails, $poDetails);
// 			}
// 			$arrayLength = count($siteDetails);
			
// 			for ($i=0; $i < $arrayLength; $i++) { 
// 				for ($j= $i+1; $j < $arrayLength; $j++) { 
// 					if ($siteDetails[$i]['total_expense'] < $siteDetails[$j]['total_expense']) {
// 						$tempArray = $siteDetails[$i];
// 						$siteDetails[$i] = $siteDetails[$j];
// 						$siteDetails[$j] = $tempArray;
// 					}
// 				}
// 			}
// // 			print_r($siteDetails);
// // 			exit;
// 			$this->view->siteDetails = $this->array_sort($siteDetails,'last_fund_transfer_date');
// 		} catch(Exception $e){
// 			echo $e->getMessage();
// 			exit;
// 		}
// 	}
public function indexAction()
{
   
    try {
        $this->checklogin(); 

        $this->view->params   = $params = $this->getRequest()->getParams();
        $this->view->messages = $this->_flashMessenger->getMessages();

        $siteDetails = array();

        /* ================= TOTAL EXPENSE (ALL SITES) ================= */
        $totalExpenseAmountQuery = $this->dbAdapter->select()
            ->from("tbl_site_expense", array('SUM(amount) AS total_amount'));

        if (!empty($params['from_date']) && !empty($params['to_date'])) {

            $totalExpenseAmountQuery->where(
                "DATE(transfer_date) BETWEEN ? AND ?",
                array(
                    $this->dateConverter($params['from_date']),
                    $this->dateConverter($params['to_date'])
                )
            );

        } elseif (!empty($params['quarter'])) {

            $yearArr = explode('-', $params['quarter']);
            $year    = $yearArr[0];

            if ($params['quarter'] == 1) {
                $start_date = $year.'-04-01';
                $end_date   = $year.'-06-30';
            } elseif ($params['quarter'] == 2) {
                $start_date = $year.'-07-01';
                $end_date   = $year.'-09-30';
            } elseif ($params['quarter'] == 3) {
                $start_date = $year.'-10-01';
                $end_date   = $year.'-12-31';
            } else {
                $start_date = ($year + 1).'-01-01';
                $end_date   = ($year + 1).'-03-31';
            }

            $totalExpenseAmountQuery->where(
                "DATE(transfer_date) BETWEEN ? AND ?",
                array($start_date, $end_date)
            );
        }

        $this->view->total_amount = $this->dbAdapter->fetchRow($totalExpenseAmountQuery);

        /* ================= SITE LIST ================= */
        $siteDetailsQuery = $this->dbAdapter->select()
            ->from("tbl_po_sites", array("id","po_no","site_id","site_name","order_date","status"))
            ->where('is_deleted = ?', 0)
            ->order("order_date DESC");

        $siteDetailsResult = $this->dbAdapter->fetchAll($siteDetailsQuery);
        
        foreach ($siteDetailsResult as $poDetails) {

            /* ===== TOTAL SITE EXPENSE (FIXED) ===== */
            $totalSiteExpenseQuery = $this->dbAdapter->select()
                ->from("tbl_site_expense", array(
                    "SUM(amount) AS total_expense"
                ))
                ->where("site_id = ?", $poDetails['site_id'])
                ->where("po_no = ?", $poDetails['po_no'])
                ->where("status = 1");

            /* ===== LAST TRANSFER DATE ===== */
            $lastTransferDateQuery = $this->dbAdapter->select()
                ->from("tbl_site_expense", array("transfer_date"))
                ->where("site_id = ?", $poDetails['site_id'])
                ->where("po_no = ?", $poDetails['po_no'])
                ->where("status = 1")
                ->order("transfer_date DESC")
                ->limit(1);

            /* ===== LAST ADDED BY ===== */
            $lastAddedByQuery = $this->dbAdapter->select()
                ->from("tbl_site_expense", array("created_at"))
                ->joinLeft(
                    "tbl_user",
                    "tbl_user.id = tbl_site_expense.created_by",
                    array("name")
                )
                ->where("tbl_site_expense.site_id = ?", $poDetails['site_id'])
                ->where("tbl_site_expense.po_no = ?", $poDetails['po_no'])
                ->where("tbl_site_expense.status = 1")
                ->order("tbl_site_expense.created_at DESC")
                ->limit(1);

            /* ===== BALANCE AMOUNT ===== */
            $totalSiteExpenseDetailsQuery = $this->dbAdapter->select()
                ->from("tbl_site_expense", array())
                ->joinLeft(
                    "tbl_site_expense_details",
                    "tbl_site_expense.id = tbl_site_expense_details.site_expense_id",
                    array("SUM(spent_amount) AS balance_amount")
                )
                ->where("tbl_site_expense.site_id = ?", $poDetails['site_id'])
                ->where("tbl_site_expense.po_no = ?", $poDetails['po_no'])
                ->where("tbl_site_expense.status = 1");

            /* ===== DATE FILTER ===== */
            if (!empty($params['from_date']) && !empty($params['to_date'])) {

                $totalSiteExpenseQuery->where(
                    "DATE(transfer_date) BETWEEN ? AND ?",
                    array(
                        $this->dateConverter($params['from_date']),
                        $this->dateConverter($params['to_date'])
                    )
                );
            }

            /* ===== FETCH DATA ===== */
            $totalSiteExpenseResult        = $this->dbAdapter->fetchRow($totalSiteExpenseQuery);
            $lastTransferDateResult        = $this->dbAdapter->fetchRow($lastTransferDateQuery);
            $lastAddedByResult             = $this->dbAdapter->fetchRow($lastAddedByQuery);
            $totalSiteExpenseDetailsResult = $this->dbAdapter->fetchRow($totalSiteExpenseDetailsQuery);

            /* ===== ASSIGN VALUES ===== */
            $poDetails['total_expense']            = $totalSiteExpenseResult['total_expense'] ?? 0;
            $poDetails['last_fund_transfer_date']  = $lastTransferDateResult['transfer_date'] ?? null;
            $poDetails['last_expense_added_by']    = $lastAddedByResult['name'] ?? null;
            $poDetails['last_expense_added_date']  = $lastAddedByResult['created_at'] ?? null;
            $poDetails['balance_amount']            = $totalSiteExpenseDetailsResult['balance_amount'] ?? 0;

            $siteDetails[] = $poDetails;
        }

        /* ===== SORT BY EXPENSE ===== */
        usort($siteDetails, function ($a, $b) {
            return $b['total_expense'] <=> $a['total_expense'];
        });
//         echo "<pre>";
// print_r($siteDetails);
// exit;
        $this->view->siteDetails = $this->array_sort($siteDetails, 'last_fund_transfer_date');

    } catch (Exception $e) {
        echo $e->getMessage();
        exit;
    }
}

	
	function array_sort($array, $on, $order=SORT_DESC){
		$new_array = array();
		$sortable_array = array();
		if (count($array) > 0) {
			foreach ($array as $k => $v) {
				if (is_array($v)) {
					foreach ($v as $k2 => $v2) {
						if ($k2 == $on) {
							$sortable_array[$k] = $v2;
						}
					}
				} else {
					$sortable_array[$k] = $v;
				}
			}
			switch ($order) {
				case SORT_ASC:
				asort($sortable_array);
				break;
				case SORT_DESC:
				arsort($sortable_array);
				break;
			}
			foreach ($sortable_array as $k => $v) {
				$new_array[$k] = $array[$k];
			}
		}
		return $new_array;
	}
	public function exportSiteExpenseAction(){
		try{
			$this->checklogin(); 
			$this->view->params = $params = $this->getRequest()->getParams();
			$this->view->messages   = $this->_flashMessenger->getMessages();
			$siteDetails = array();
			$siteDetailsQuery = $this->dbAdapter->select()
			->from("tbl_po_sites", array("id","po_no","site_id","site_name","order_date","status"))
			->where('is_deleted = ?', 0)
			->order("order_date desc");
			$siteDetailsResult = $this->dbAdapter->fetchAll($siteDetailsQuery);
			// echo "<pre>";
			// print_r($siteDetailsResult);
			// exit;
			foreach ($siteDetailsResult as $poDetails) {
				$totalSiteExpenseQuery = $this->dbAdapter->select()
				->from("tbl_site_expense",array("sum(amount) as total_expense","transfer_date"))
				->where("site_id = ?",$poDetails['site_id'])
				->where("po_no = ?", $poDetails['po_no'])
				->where('status = 1');

				if(isset($params['from_date']) && $params['from_date'] != "" && isset($params['to_date']) && $params['to_date'] != ""){
					$this->view->from_date = $params['from_date'];
					$this->view->to_date = $params['to_date'];
					$totalSiteExpenseQuery->where("date(transfer_date) BETWEEN '".$this->dateConverter($params['from_date'])."'  AND '".$this->dateConverter($params['to_date'])."'");
				}
				// echo $totalSiteExpenseQuery;
				// exit;
				$totalSiteExpenseResult = $this->dbAdapter->fetchRow($totalSiteExpenseQuery);
				$poDetails['total_expense'] = $totalSiteExpenseResult['total_expense'];
				$poDetails['last_fund_transfer_date'] = $totalSiteExpenseResult['transfer_date'];
				array_push($siteDetails, $poDetails);
			}
			$arrayLength = count($siteDetails);

			for ($i=0; $i < $arrayLength; $i++) { 
				for ($j= $i+1; $j < $arrayLength; $j++) { 
					if ($siteDetails[$i]['total_expense'] < $siteDetails[$j]['total_expense']) {
						$tempArray = $siteDetails[$i];
						$siteDetails[$i] = $siteDetails[$j];
						$siteDetails[$j] = $tempArray;
					}
				}
			}
			$this->view->siteDetails = $siteDetails;

			$fileName = "ExpensSiteReport.xls"; 
         // echo'<pre>';
         // print_r($milkresult);
         // exit;
			$data = array(array('Sr. No.'=> "",'PO Number'=> "", 'PO Date'=> "",'Site ID'=> "",'Site Name'=> "",'Expenses'=> "" ,'Last Fund Transferred Date'=> ""));
			$i = 2; 
			foreach ($siteDetails as $rs) {

				$row   = array();
				$row[] = stripslashes($i-1);
				$row[] = stripslashes($rs["po_no"]);
				$row[] =  date('d/m/Y', strtotime($rs['order_date']));
				$row[] = stripslashes($rs["site_id"]);
				$row[] = stripslashes($rs["site_name"]);
				$row[] = stripslashes($rs["total_expense"]);
				$row[] = stripslashes($rs["last_fund_transfer_date"]);

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
	function invenDescSort($item1,$item2)
	{
		if ($item1['total_expense'] == $item2['total_expense']) return 0;
		return ($item1['total_expense'] < $item2['total_expense']) ? 1 : -1;
	}
	public function siteExpenseDetailsAction()
	{
		try{
			$this->checklogin();
			$this->view->role_type 	= $this->role_type;
			$this->view->role 		= $this->role;
			$this->view->params = $params = $this->getRequest()->getParams();
			$siteAndPoQuery = $this->dbAdapter->select()
			->from('tbl_po_sites', array('po_no','site_id'))
			->where('md5(site_id) = ?', $params['site-id'])
			->where('is_deleted = ?', 0)
			->where('md5(po_no) = ?', $params['po-number']);
			$this->view->poAndSite = $siteAndPoResult = $this->dbAdapter->fetchRow($siteAndPoQuery);
			$siteExpenseDetailsQuery = $this->dbAdapter->select()
			->from('tbl_site_expense', array('id','amount','transfer_date','allocation_type','transfered_to','transfer_to_name','remark','nature_of_work'))
			->joinLeft("tbl_companies","tbl_companies.id = tbl_site_expense.company_id", array("name as company"))
			->joinLeft("tbl_payment_modes","tbl_payment_modes.id = tbl_site_expense.payment_mode_id", array("payment_mode"))
			->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = tbl_site_expense.bank_account_id", array("bank_name","bank_account_number"))
			->where('md5(tbl_site_expense.site_id) = ?', $params['site-id'])
			->where('md5(tbl_site_expense.po_no) = ?', $params['po-number'])
			->where('tbl_site_expense.status = 1')
			->order('tbl_site_expense.transfer_date desc');
			$siteExpenseDetailsResult = $this->dbAdapter->fetchAll($siteExpenseDetailsQuery);
			$this->view->site_id = $params['site-id'];
			$this->view->po_number = $params['po-number'];
			$this->view->siteExpenseDetails = $siteExpenseDetailsResult;
			$user = new Application_Model_User(); 
			$expenseArr = array();
			$finalArr = array();
			foreach($siteExpenseDetailsResult as $siteExpense) {
			    $expenseArr['id'] = $siteExpense['id'];
			    $expenseArr['company'] = $siteExpense['company'];
			     $expenseArr['transfer_date'] = $siteExpense['transfer_date'];
			 //   if($siteExpense['transfer_date'] = '0000-00-00') {
    //                 $expenseArr['transfer_date'] = '00/00/0000';
			 //   } else {
			 //       $expenseArr['transfer_date'] = date('d/m/Y', strtotime($siteExpense['transfer_date']));
			 //   }
			    $expenseArr['allocation_type'] = ucwords(strtolower($siteExpense['allocation_type']));
			    $b = str_replace( ',', '', $siteExpense['amount'] );
                if( is_numeric( $b ) ) {
                $siteExpense['amount'] = $b;
                } 
			    $expenseArr['amount'] = $b;
			    $expenseArr['totalBalance'] = $user->getTotalBalance($siteExpense['id']);
			    $expenseArr['transfer_to_name'] = $siteExpense['transfer_to_name'];
			    $expenseArr['bank_name'] = $siteExpense['bank_name'];
			    $expenseArr['bank_account_number'] = $siteExpense['bank_account_number'];
			    $expenseArr['payment_mode'] = $siteExpense['payment_mode'];
			    
			    array_push($finalArr, $expenseArr);
			}
// 			print_r($expenseArr['amount']);
// 			exit;
			$this->view->siteExpenseDetails = $finalArr;
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
	}
	
	
	public function exportSiteExpenseDetailsAction()
	{
		try{
			$this->checklogin();
			$this->view->role_type 	= $this->role_type;
			$this->view->role 		= $this->role;
			$this->view->params = $params = $this->getRequest()->getParams();
		
			$siteAndPoQuery = $this->dbAdapter->select()
			->from('tbl_po_sites', array('po_no','site_id'))
			->where('site_id = ?', $params['site-id'])
			->where('is_deleted = ?', 0)
			->where('po_no = ?', $params['po-number']);
		
			$this->view->poAndSite = $siteAndPoResult = $this->dbAdapter->fetchRow($siteAndPoQuery);
		    $siteExpenseDetailsQuery = $this->dbAdapter->select()
			->from('tbl_site_expense', array('id','amount','transfer_date','allocation_type','transfered_to','transfer_to_name','remark','nature_of_work'))
			->joinLeft("tbl_companies","tbl_companies.id = tbl_site_expense.company_id", array("name as company"))
			->joinLeft("tbl_payment_modes","tbl_payment_modes.id = tbl_site_expense.payment_mode_id", array("payment_mode"))
			->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = tbl_site_expense.bank_account_id", array("bank_name","bank_account_number"))
			->where('md5(tbl_site_expense.site_id) = ?', $params['site-id'])
			->where('md5(tbl_site_expense.po_no) = ?', $params['po-number'])
			->where('tbl_site_expense.status = 1')
			->order('tbl_site_expense.transfer_date desc');
			$siteExpenseDetailsResult = $this->dbAdapter->fetchAll($siteExpenseDetailsQuery);
			$this->view->siteExpenseDetails = $siteExpenseDetailsResult;
			
			
		    $fileName = "ExportSiteExpenseDetailsReport.xls"; 
        //   echo'<pre>';
        //   print_r($siteExpenseDetailsResult);
        //   exit;
			$data = array(array('Sr. No.'=> "",'Company'=> "", 'Transfer Date'=> "",'Transfer Amount'=> "",'Transfer Type'=> "",'Transfer To'=> "" ,'Bank Account'=> "",'Payment Mode'=> ""));
			$i = 2; 
			foreach ($siteExpenseDetailsResult as $rs) {

				$row   = array();
				$row[] = stripslashes($i-1);
				$row[] = stripslashes($rs["company"]);
				if($rs['transfer_date'] == '0000-00-00') {
                    $row[] = '00/00/0000';
                } else {
                    $row[] =  date('d/m/Y', strtotime($rs['transfer_date']));
                }
				$row[] = stripslashes($rs["amount"]);
				$row[] = stripslashes($rs["allocation_type"]);
				$row[] = stripslashes($rs["transfer_to_name"]);
				$row[] = $rs['bank_name'].'/'.$rs['bank_account_number'];
				$row[] = stripslashes($rs["payment_mode"]);

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
			
			
			
			
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
		exit;
	}
	
	public function exportSiteExpenseRowWiseDetailsAction()
	{
		try{
			$this->checklogin();
			$this->view->role_type 	= $this->role_type;
			$this->view->role 		= $this->role;
			$this->view->params = $params = $this->getRequest()->getParams();
			$siteAndPoQuery = $this->dbAdapter->select()
			->from('tbl_po_sites', array('po_no','site_id'))
			->where('md5(site_id) = ?', $params['site-id'])
			->where('is_deleted = ?', 0)
			->where('md5(po_no) = ?', $params['po-number']);
			$this->view->poAndSite = $siteAndPoResult = $this->dbAdapter->fetchRow($siteAndPoQuery);
		    $siteExpenseDetailsQuery = $this->dbAdapter->select()
			->from('tbl_site_expense', array('id','amount','transfer_date','allocation_type','transfered_to','transfer_to_name','remark','nature_of_work'))
			->joinLeft("tbl_companies","tbl_companies.id = tbl_site_expense.company_id", array("name as company"))
			->join("tbl_site_expense_details","tbl_site_expense_details.site_expense_id = tbl_site_expense.id", array("spent_amount","spent_remark"))
			->joinLeft("tbl_payment_modes","tbl_payment_modes.id = tbl_site_expense.payment_mode_id", array("payment_mode"))
			->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = tbl_site_expense.bank_account_id", array("bank_name","bank_account_number"))
			->where('md5(tbl_site_expense.site_id) = ?', $params['site-id'])
			->where('md5(tbl_site_expense.po_no) = ?', $params['po-number'])
			->where('tbl_site_expense.status = 1')
			->order('tbl_site_expense.transfer_date desc');
			$siteExpenseDetailsResult = $this->dbAdapter->fetchAll($siteExpenseDetailsQuery);
			$this->view->siteExpenseDetails = $siteExpenseDetailsResult;
			
			
		    $fileName = "ExportSiteExpenseDetailsReport.xls"; 
        //   echo'<pre>';
        //   print_r($siteExpenseDetailsResult);
        //   exit;
			$data = array(array('Sr. No.'=> "",'Company'=> "", 'Transfer Date'=> "",'Spent Amount'=> "",'Spent Remark'=> "",'Transfer Type'=> "",'Transfer To'=> "" ,'Bank Account'=> "",'Payment Mode'=> ""));
			$i = 2; 
			foreach ($siteExpenseDetailsResult as $rs) {

				$row   = array();
				$row[] = stripslashes($i-1);
				$row[] = stripslashes($rs["company"]);
				if($rs['transfer_date'] == '0000-00-00') {
                    $row[] = '00/00/0000';
                } else {
                    $row[] =  date('d/m/Y', strtotime($rs['transfer_date']));
                }
				$row[] = stripslashes($rs["spent_amount"]);
				$row[] = stripslashes($rs["spent_remark"]);
				$row[] = stripslashes($rs["allocation_type"]);
				$row[] = stripslashes($rs["transfer_to_name"]);
				$row[] = $rs['bank_name'].'/'.$rs['bank_account_number'];
				$row[] = stripslashes($rs["payment_mode"]);

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
			
			
			
			
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
		exit;
	}
	
	public function getExpenseDetailsAction()
	{
		try {
			$this->checklogin();
			$params = $this->getRequest()->getParams();
			if ($this->getRequest()->isPost()) {
				$expenseDetailsQuery = $this->dbAdapter->select()
				->from('tbl_site_expense_details', array('id','expense_in','expense_for','transferred_to','transferred_to_id','spent_amount','spent_remark','expense_date','attachment_path','created_at'))
				->where('site_expense_id = ?', $params['expenseId'])
				->where('status = 1');

				$expenseDetailsResult = $this->dbAdapter->fetchAll($expenseDetailsQuery);
				if ($expenseDetailsResult) {
					$expneseDetailsArray = array();
					foreach ($expenseDetailsResult as $expenseDetails) {
						if ($expenseDetails['transferred_to'] == "material supplier") {
							$materialSupplierNameQuery = $this->dbAdapter->select()
							->from('tbl_material_supplier', array('id','supplier_name'))
							->where('id = ?', $expenseDetails['transferred_to_id']);
							$materialSupplierNameResult = $this->dbAdapter->fetchRow($materialSupplierNameQuery);
							$expenseDetails['supplier_id'] = $materialSupplierNameResult['id'];
							$expenseDetails['supplier_name'] = $materialSupplierNameResult['supplier_name'];
							array_push($expneseDetailsArray, $expenseDetails);
						} else if ($expenseDetails['transferred_to'] == "vendor") {
							$vendorNameQuery = $this->dbAdapter->select()
							->from('tbl_vendor', array('id','contact_person'))
							->where('id = ?', $expenseDetails['transferred_to_id']);
							$vendorNameResult = $this->dbAdapter->fetchRow($vendorNameQuery);
							$expenseDetails['vendor_id'] = $vendorNameResult['id'];
							$expenseDetails['vendor_name'] = $vendorNameResult['contact_person'];
							array_push($expneseDetailsArray, $expenseDetails);
						} else {
							$staffNameQuery = $this->dbAdapter->select()
							->from('tbl_user', array('id','name'))
							->where('id = ?', $expenseDetails['transferred_to_id']);
							$staffNameResult = $this->dbAdapter->fetchRow($staffNameQuery);
							$expenseDetails['staff_id'] = $staffNameResult['id'];
							$expenseDetails['staff_name'] = $staffNameResult['supplier_name'];
							array_push($expneseDetailsArray, $expenseDetails);
						}
					}
				}
				$this->view->expenseDetails = $expneseDetailsArray;
				$expenseDetailsTotalQuery = $this->dbAdapter->select()
				->from('tbl_site_expense_details', array("sum(spent_amount) as balance_amount"))
				->where('site_expense_id = ?', $params['expenseId'])
				->where('status = 1');
				$expenseDetailsTotalResult = $this->dbAdapter->fetchRow($expenseDetailsTotalQuery);
				$this->view->expenseTotal = $expenseDetailsTotalResult['balance_amount'];
			}
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
		$this->_helper->layout()->disableLayout();
	}
	public function expenseListAction(){
		$this->checklogin(); 
		$auth                  = Zend_Auth::getInstance();
		$authStorage           = $auth->getStorage();
		$this->WebLoginID      = $authStorage->read()->WebLoginID;
		$this->id              = $authStorage->read()->id;
		$this->Role            = $authStorage->read()->Role; 
		$this->role_type       = $authStorage->read()->role_type;
		$params                = $this->view->params = $this->getRequest()->getParams(); 
		$this->view->totalnum  = $params['page'];
		$this->_helper->layout()->disableLayout(); 
		$this->view->messages  = $this->_flashMessenger->getMessages(); 
		$db = Zend_Db_Table::getDefaultAdapter();

		if ($params['type'] == 1) {
			$dataArray = array();
			$dataArray['po_no'] = $this->test_input($params['po_no']); 
			$dataArray['site_id'] = $this->test_input($params['site_id']); 
			$dataArray['invoice_no'] = $this->test_input($params['invoice_no']); 
			$dataArray['invoice_value'] = $this->test_input($params['invoice_val']); 
			$dataArray['margin'] = $params['invoice_val'] - $params['expense']; 
			$dataArray['created_at'] = date('Y-m-d H:i:s'); 
			if(isset($_FILES['invoice_document']['error'] )){
				if( $_FILES['invoice_document']['error'] == '0' ){
					move_uploaded_file($_FILES['invoice_document']['tmp_name'],"uploads/expense/".$_FILES['invoice_document']['name']);
					$dataArray['invoice_doc'] = "/uploads/expense/".$_FILES['invoice_document']['name'];
				}else {
					$dataArray['invoice_doc'] = "";  
				}
			}
			if(isset($_FILES['bill_document']['error'] ) ){
				if( $_FILES['bill_document']['error'] == '0' ){
					move_uploaded_file($_FILES['bill_document']['tmp_name'],"uploads/expense/".$_FILES['bill_document']['name']);
					$dataArray['bill_doc'] = "/uploads/expense/".$_FILES['bill_document']['name'];
				}else {
					$dataArray['bill_doc'] = "";  
				}
			}
			try {
				$db->insert('tbl_invoice_details', $dataArray);

			} catch(Exception $e){
				$error= $e->getMessage();
			}
		}
		if ($params['type'] == 2) {
			$invoice_sql = "SELECT * FROM tbl_invoice_details WHERE po_no=".$params['po_no']." AND site_id= '".$params['site_id']."'";
			$invoice_result = $db->fetchRow($invoice_sql);
			if ($invoice_result) {
				$dataArray = array();
				$dataArray['po_no'] = $this->test_input($params['po_no']); 
				$dataArray['site_id'] = $this->test_input($params['site_id']); 
				$dataArray['invoice_no'] = $this->test_input($params['invoice_no']); 
				$dataArray['invoice_value'] = $this->test_input($params['invoice_val']); 
				$dataArray['margin'] = $params['invoice_val'] - $params['expense']; 
				$dataArray['created_at'] = date('Y-m-d H:i:s'); 
				if(isset($_FILES['invoice_document']['error'] )){
					if( $_FILES['invoice_document']['error'] == '0' ){
						move_uploaded_file($_FILES['invoice_document']['tmp_name'],"uploads/expense/".$_FILES['invoice_document']['name']);
						$dataArray['invoice_doc'] = "/uploads/expense/".$_FILES['invoice_document']['name'];
					}else {
						$dataArray['invoice_doc'] = "";  
					}
				}
				if(isset($_FILES['bill_document']['error'] ) ){
					if( $_FILES['bill_document']['error'] == '0' ){
						move_uploaded_file($_FILES['bill_document']['tmp_name'],"uploads/expense/".$_FILES['bill_document']['name']);
						$dataArray['bill_doc'] = "/uploads/expense/".$_FILES['bill_document']['name'];
					}else {
						$dataArray['bill_doc'] = "";  
					}
				}
				try {
					$db->update('tbl_invoice_details', $dataArray, array('id=?'=>$invoice_result['id']));

				} catch(Exception $e){
					$error= $e->getMessage();
				}
			}
		}

		$user = new Application_Model_User();
		$sum=0;
		if($this->role_type!='1'){
			$this->_redirect('/authlogout/logout');
		}
		if($params['order']){
			if($params['type']){
				$order .="order by ".$params['type']." ".$params['order']." ";
			}else{
				$order .="order by date(order_date) desc";
			}
		}else{
			$order .="order by date(order_date) desc";
		}
		if($params['ponumber']){ $cond .="and po_no LIKE '".$params['ponumber']."%' "; } 
		if($params['siteid']){   $cond .="and description LIKE '%".$params['siteid']."%' "; } 
		$qry_all_po = "SELECT po_no FROM tbl_expense_report where 1 $cond $order";
		$res_all_po = $this->dbAdapter->fetchAll($qry_all_po);
		$keycount = 0; $all_po = array();
		foreach ($res_all_po as $key_all => $val_all) {
			$all_po[$keycount] = $val_all['po_no']; 
			$keycount++;
		} 
		$all_po = array_unique($all_po);
		$super_array = array();
		foreach ($all_po as $all_key => $all_val) {
			$sql_abc = "select * from tbl_expense_report where po_no = '".$all_val."' order by id desc limit 1";
			$res_abc  = $this->dbAdapter->fetchRow($sql_abc);
			$sub_super_array = array('po_no'=>$all_val , 'operating_unit'=>$res_abc['operating_unit'] , 
				'document_type'=>$res_abc['document_type'] , 'description'=>$res_abc['description'], 
				'order_date'=>$res_abc['order_date'] , 'buyer'=>$res_abc['buyer'],
				'currency'=>$res_abc['currency'], 'amount'=>$res_abc['amount'], 
				'inclusive_tax'=>$res_abc['inclusive_tax'], 'exclusive_tax'=>$res_abc['exclusive_tax'],
				'tax_amount'=>$res_abc['tax_amount'] , 'status'=>$res_abc['status'],
				'acknowledgement'=>$res_abc['acknowledgement'] ,
				'change_request_status'=>$res_abc['change_request_status']);
			array_push($super_array,$sub_super_array);
		} 
          /*$query_po = "select * from tbl_expense_report where rev!='1' $cond $order";
          $po_list  = $this->dbAdapter->fetchAll($query_po);*/
          $main_array = array(); 
          foreach($super_array as $val){
          	$arr = explode('-',$val['description']); $arr1=array(); $k=0;
          	foreach ($arr as $key => $value) {
          		if($key!='0'){
          			$arr1[$k]=$value;
          			$k++;
          		}
          	}
          	$size=sizeof($arr1);
          	$sub_array = array('po_number'=>$val['po_no'],'order_date'=>$val['order_date'],'description'=>$val['description'],
          		'site_ids'=>$arr1,'amount'=>$val['amount'],'inclusive_tax'=>$val['inclusive_tax'],'exclusive_tax'=>$val['exclusive_tax'],'tax_amount'=>$val['exclusive_tax'],'size_of_array'=>$size,'change_request_status'=>$val['change_request_status'],'status'=>$val['status'],'acknowledgement'=>$val['acknowledgement']);
          	array_push($main_array,$sub_array);
          	$sum = $sum+$user->getExpensesByPo($val['po_no']);
          }
          $this->view->sum = $sum;
          $page=$this->_getParam('page',1);
          $paginator = Zend_Paginator::factory($main_array);      
          $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); 
          $paginator->setItemCountPerPage(10); 
          $this->view->paginator = $paginator;
          $this->view->totalrec = $paginator->getTotalItemCount();
          if($params['type'] == 'id' && $params['order'] == 'desc' ) { 
          	$this->view->id_order = 'asc';  
          }
          else if($params['type'] == 'id' && $params['order'] == 'asc' ) { 
          	$this->view->id_order = 'desc';  }
          }
          
          public function showDetailedExpenseListAction(){
          	$this->checklogin(); 
          	$auth                  = Zend_Auth::getInstance();
          	$authStorage           = $auth->getStorage();
          	$this->WebLoginID      = $authStorage->read()->WebLoginID;
          	$this->id              = $authStorage->read()->id;
          	$this->Role            = $authStorage->read()->Role; 
          	$this->access_token    = $authStorage->read()->access_token;
          	$this->role_type       = $authStorage->read()->role_type;
          	$params                = $this->view->params = $this->getRequest()->getParams();
          	$this->view->messages  = $this->_flashMessenger->getMessages();
          	$this->_helper->layout()->disableLayout();
         //$this->getHelper('ViewRenderer')->setNoRender();
          	if($this->role_type!='1'){
          		$this->_redirect('/authlogout/logout');
          	}
          	$query="select * from tbl_expense where po_no= '".$params['po_no']."' and site_id='".$params['site_id']."' ";
          	$resultqry=$this->dbAdapter->fetchAll($query);
          	$main_array = array();
          	foreach ($resultqry as $key) {
          		$query_transfer="select expense_transfer_for as transfer_for from tbl_expense_transfer_for_master where id = '".$key['transfer_for']."' ";
          		$result_transfer=$this->dbAdapter->fetchRow($query_transfer);
          		$query_transferto="select name as name from tbl_user where id = '".$key['transfered_to']."' ";
          		$result_transferto=$this->dbAdapter->fetchRow($query_transferto);
          		$sub_array = array('po_no'=>$key['po_no'],'site_id'=>$key['site_id'],'transfer_for'=>$result_transfer['transfer_for'],'amount'=>$key['amount'],'transfer_date'=>date('d/m/Y', strtotime( $key['transfer_date']) ),'transfered_to'=>$result_transferto['name'],'remark'=>$key['remark'], 'attachment'=>$key['attachment'] );
          		array_push($main_array,$sub_array);
          	}
          	$this->view->result_qry = $result_qry = $main_array;
          }
          /*-----------------METHOD-START : OFFICE EXPENSE REPORT----------------*/
          public function officeExpensesAction(){
          	try {
          		$this->checklogin(); 
          		$params                = $this->view->params = $this->getRequest()->getParams(); 
          		$this->view->messages        = $messages     = $this->_flashMessenger->getMessages(); 
          		$this->view->role_type = $this->role_type;
          		$sum_amount = 0;
          		if($this->role_type != 1 && $this->role_type != 4){
          			// $this->_redirect('/authlogout/logout');
          			echo 'Invalid Access';exit;
          		} 
          		
          		$companiesQuery = $this->dbAdapter->select()
          		->from("tbl_companies", array("*"))
          		->where("is_active = 1");
          		$this->view->companies = $expenseTypeListResult = $this->dbAdapter->fetchAll($companiesQuery);

          		$officeExpensesDetailsQuery = $this->dbAdapter->select()
          		->from("tbl_office_expense as toe", array("*"))
          		->joinLeft("tbl_user as tu","tu.id = toe.transfered_to", array("tu.name"))
          		->joinLeft("tbl_companies as c","c.id = toe.company_id", array("c.name as company"))
          		->joinLeft("tbl_payment_modes","tbl_payment_modes.id = toe.payment_mode_id", array("payment_mode"))
          		->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = toe.bank_account_id", array("bank_name","bank_account_number"))
          		->where('toe.is_deleted = 0')
          		->order("toe.transfer_date desc");

          		if(isset($params['from_date']) && $params['from_date'] != "" && isset($params['to_date']) && $params['to_date'] != ""){
          			$this->view->from_date = $params['from_date'];
          			$this->view->to_date = $params['to_date'];
          			$officeExpensesDetailsQuery->where("date(toe.transfer_date) BETWEEN '".$this->dateConverter($params['from_date'])."'  AND '".$this->dateConverter($params['to_date'])."'");
          		}
          		if(isset($params['company_id']) && $params['company_id'] != ""){
          			$this->view->company_id = $params['company_id'];
          			$officeExpensesDetailsQuery->where("toe.company_id=?",$params['company_id']);
          		}
          		$this->view->officeExpenseDetails = $officeExpensesDetailsResult = $this->dbAdapter->fetchAll($officeExpensesDetailsQuery);


          		$totalExpenseAmountQuery = $this->dbAdapter->select()
          		->from("tbl_office_expense", array('sum(amount) as total_amount'))
          		->where('is_deleted = 0')
          		->order("transfer_date desc");

          		if(isset($params['from_date']) && $params['from_date'] != "" && isset($params['to_date']) && $params['to_date'] != "" && isset($params['company_id']) && $params['company_id'] != ""){
          			$totalExpenseAmountQuery->where("date(transfer_date) BETWEEN '".$this->dateConverter($params['from_date'])."'  AND '".$this->dateConverter($params['to_date'])."' and company_id = ".$params['company_id']);
          		}
          		$this->view->total_amount = $total_amount = $this->dbAdapter->fetchRow($totalExpenseAmountQuery);
          	} catch(Exception $e){
          		echo $e->getMessage();
          		exit;
          	}
          }
          /*--------------------METHOD-END : OFFICE EXPENSE REPORT-------------------------*/
          /*-----------------METHOD-START : OFFICE EXPENSE REPORT IMPORT --------------*/

          public function exportOfficeExpenseAction(){
          	try{
          		$this->checklogin(); 
          		$params                = $this->view->params = $this->getRequest()->getParams(); 
          		$this->view->messages        = $messages     = $this->_flashMessenger->getMessages(); 
          		$this->view->role_type = $this->role_type;
          		$sum_amount = 0;
          		if($this->role_type != 1 && $this->role_type != 4){
          			$this->_redirect('/authlogout/logout');
          		} 

          		$companiesQuery = $this->dbAdapter->select()
          		->from("tbl_companies", array("*"))
          		->where("is_active = 1");
          		$this->view->companies = $expenseTypeListResult = $this->dbAdapter->fetchAll($companiesQuery);

          		$officeExpensesDetailsQuery = $this->dbAdapter->select()
          		->from("tbl_office_expense as toe", array("*"))
          		->joinLeft("tbl_user as tu","tu.id = toe.transfered_to", array("tu.name"))
          		->joinLeft("tbl_companies as c","c.id = toe.company_id", array("c.name as company"))
          		->joinLeft("tbl_payment_modes","tbl_payment_modes.id = toe.payment_mode_id", array("payment_mode"))
          		->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = toe.bank_account_id", array("bank_name","bank_account_number"))
          		->where('toe.is_deleted = 0')
          		->order("toe.transfer_date desc");

          		if(isset($params['from_date']) && $params['from_date'] != "" && isset($params['to_date']) && $params['to_date'] != ""){
          			$this->view->from_date = $params['from_date'];
          			$this->view->to_date = $params['to_date'];
          			$officeExpensesDetailsQuery->where("date(toe.transfer_date) BETWEEN '".$this->dateConverter($params['from_date'])."'  AND '".$this->dateConverter($params['to_date'])."'");
          		}
          		if(isset($params['company_id']) && $params['company_id'] != ""){
          			$this->view->company_id = $params['company_id'];
          			$officeExpensesDetailsQuery->where("toe.company_id=?",$params['company_id']);
          		}
          		$this->view->officeExpenseDetails = $officeExpensesDetailsResult = $this->dbAdapter->fetchAll($officeExpensesDetailsQuery);


          		$totalExpenseAmountQuery = $this->dbAdapter->select()
          		->from("tbl_office_expense", array('sum(amount) as total_amount'))
          		->where('is_deleted = 0')
          		->order("transfer_date desc");

          		if(isset($params['from_date']) && $params['from_date'] != "" && isset($params['to_date']) && $params['to_date'] != ""){
          			$totalExpenseAmountQuery->where("date(transfer_date) BETWEEN '".$this->dateConverter($params['from_date'])."'  AND '".$this->dateConverter($params['to_date'])."'");
          		}
          		$this->view->total_amount = $total_amount = $this->dbAdapter->fetchRow($totalExpenseAmountQuery);

          		$fileName = "ExpensOfficeReport.xls"; 

          		$data = array(array('Sr. No.'=> "",'Company'=> "", 'Transfer Date'=> "",'Transfered To'=> "",'Amount'=> "",'Remark'=> "" ,'Bank Account'=> "",'Bill/Attachment Number'=> "",'Bill/Attachment'=> ""));
          		$i = 2; 
          		foreach ($officeExpensesDetailsResult as $officeExpense) {
          			// print_r($officeExpense);
          			// exit;

          			$row   = array();
          			$row[] = stripslashes($i-1);
          			$row[] = stripslashes($officeExpense["company"]);
          			$row[] =  date('d/m/Y', strtotime($officeExpense['transfer_date']));
          			$row[] = stripslashes($officeExpense["name"]);
          			$row[] = stripslashes($officeExpense["amount"]);
          			$row[] = stripslashes($officeExpense["remark"]);
          			$row[] = stripslashes($officeExpense["bank_account_number"]);
          			$row[] = stripslashes($officeExpense["bill_number"]);
          			$row[] = stripslashes($officeExpense["attachment"]);

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



          public function getExpenseAmountDetailsAction()
          {
          	try {
          		$this->checklogin();
          		$params = $this->getRequest()->getParams();
          		if ($this->getRequest()->isPost()) {
          			$expenseDetailsQuery = $this->dbAdapter->select()
          			->from("tbl_office_expense", array("*"))
          			->joinLeft("tbl_user","tbl_user.id = tbl_office_expense.transfered_to", array("name"))
          			->where("tbl_office_expense.id = ?", $params['expense_id']);
          			$this->view->expenseDetails = $expenseDetailsResult = $this->dbAdapter->fetchRow($expenseDetailsQuery);
          			$expenseAmountDetailsQuery = $this->dbAdapter->select()
          			->from("tbl_expense_details as ted", array("*"))
          			->joinLeft("tbl_expense_in_type_master as teitm","teitm.id = ted.expense_in_id", array("teitm.expense_in_type"))
          			->joinLeft("tbl_expense_transfer_for_master as tetfm","tetfm.id = ted.expense_for_id", array("tetfm.expense_transfer_for"))
          			->where("expense_id = ?", $params['expense_id']);
          			$this->view->expenseAmountDetails = $expenseAmountDetailsResult = $this->dbAdapter->fetchAll($expenseAmountDetailsQuery);
          		}
          		// echo '<pre>';print_r($expenseAmountDetailsResult);exit;
          		$this->_helper->layout()->disableLayout();
          	} catch(Exception $e){
          		echo $e->getMessage();
          		exit;
          	}
          }
          /*-------------------------------METHOD-END : OFFICE EXPENSE AMOUNT DETAILS -------------------*/
          /*-------------------------------METHOD-START : DELETE OFFICE EXPENSE -------------------*/
          public function deleteExpenseAction()
          {
          	try {
          		$this->checklogin();
          		$response = array();
          		$params = $this->getRequest()->getParams();
          		if (empty($params['expense_id']) || $params['expense_id'] == "") {
          			$response['flag'] = false;
          			$response['title'] = "Expense ID Missing!";
          			$response['message'] = "Please try again after refreshing the page.";
          		} else if (empty($params['type']) || $params['type'] == "") {
          			$response['flag'] = false;
          			$response['title'] = "Request Type Missing!";
          			$response['message'] = "Please try again after refreshing the page.";
          		} else {
          			if ($params['type'] == 'office_expense') { 
          				$updateData['is_deleted'] = '1';
          				//$updateData['updated_by'] = $this->id;
          				//$updateData['updated_at'] = date('Y-m-d H:i:s');
          				$where['id = ?'] = $params['expense_id'];
          				$this->dbAdapter->beginTransaction();
          				$updatedStatus = $this->dbAdapter->update('tbl_office_expense', $updateData, $where);
          				$updatedDetailsStatus = $this->dbAdapter->update('tbl_expense_details', $updateData, array('expense_id = ?'=>$params['expense_id']));
          			} else if ($params['type'] == 'site_expense') {
          				$updateData['status'] = '2';
          				//$updateData['updated_by'] = $this->id;
          				//$updateData['updated_at'] = date('Y-m-d H:i:s');
          				$where['id = ?'] = $params['expense_id'];
          				$this->dbAdapter->beginTransaction();
          				$updatedStatus = $this->dbAdapter->update('tbl_site_expense', $updateData, $where);
          				$updatedDetailsStatus = $this->dbAdapter->update('tbl_site_expense_details', $updateData, array('site_expense_id = ?'=>$params['expense_id']));
          			}
          			if ($updatedStatus == true && $updatedDetailsStatus == true) {
          				$this->dbAdapter->commit();
          				$response['flag'] = true;
          				$response['title'] = "Deleted Successfully";
          				$response['message'] = "Expense has been deleted successfully.";
          			} else {
          				$this->dbAdapter->rollBack();
          				$response['flag'] = false;
          				$response['title'] = "Deletion Failed!";
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
          /*-------------------------------METHOD-END : DELETE OFFICE EXPENSE -------------------*/

          public function officeExpensesListAction(){
          	$this->checklogin(); 
          	$auth                  = Zend_Auth::getInstance();
          	$authStorage           = $auth->getStorage();
          	$this->WebLoginID      = $authStorage->read()->WebLoginID;
          	$this->id              = $authStorage->read()->id;
          	$this->Role            = $authStorage->read()->Role; 
          	$this->role_type       = $authStorage->read()->role_type;
          	$params                = $this->view->params = $this->getRequest()->getParams(); 
          	$this->view->totalnum  = $params['page'];
          	$this->_helper->layout()->disableLayout(); 
          	$this->view->messages  = $this->_flashMessenger->getMessages(); 
          	$sum_amount = 0;
          	if($this->role_type!='1'){
          		$this->_redirect('/authlogout/logout');
          	}
          	if($params['order']){
          		if($params['type']){
          			$order .="order by a.".$params['type']." ".$params['order']." ";
          		}else{
          			$order .="order by a.transfer_date desc";
          		}
          	}else{
          		$order .="order by a.transfer_date desc";
          	}
          	if($params['date1']){ $date1 = $this->dateConverter($params['date1']);}
          	if($params['date2']){ $date2 = $this->dateConverter($params['date2']);}
          	if($params['date1'] !='' && $params['date2'] !=''){
          		$cond .="and date(a.transfer_date) BETWEEN '".$date1."' and '".$date2."' ";
          	}
          	if($params['date1'] =='' && $params['date2']==''){
          		$cond .="";
          	}
          	$sql_office = "select a.amount as ofc_amount, a.transfer_date as ofc_transfer_date ,
          	a.created as ofc_created , a.remark as ofc_remark , a.attachment as ofc_attachment , a.status as ofc_status ,
          	b.name as name , c.transfer_for as transferfor , d.state_for as statefor
          	from tbl_office_expense a
          	left join tbl_user b on (a.transfered_to = b.id)
          	left join tbl_expense_transfer_for_master c on (a.transfer_for = c.id)
          	left join tbl_state_for d on (a.state_for = d.id) WHERE 1 $cond $order";
          	$qry_office  = $this->dbAdapter->fetchAll($sql_office);
          	foreach ($qry_office as $ke => $value) {
          		$sum_amount = $sum_amount + $value['ofc_amount'];
          	}
          	$this->view->sum_amount = $sum_amount;
          	$page=$this->_getParam('page',1);
          	$paginator = Zend_Paginator::factory($qry_office);      
          	$paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); 
          	$paginator->setItemCountPerPage(20); 
          	$this->view->paginator = $paginator;
          	$this->view->totalrec = $paginator->getTotalItemCount();
          	if($params['type'] == 'Generate'){
          		$data = array(array('Sr. No.'=> "", 'Transfer For'=> "", 'State For'=> "", 'Amount'=> "", 'Transfer Date'=> "", 'Transfered To'=> "", 'Remark'=> "" ));
          		$i = 2; 
          		foreach ($qry_office as $rs) { 
          			if($rs['transferfor']){ $transferfor= $rs['transferfor']; }else { $transferfor= '-';}
          			if($rs['statefor']){ $statefor= $rs['statefor']; }else { $statefor= '-';}
          			if($rs['ofc_amount']){ $ofc_amount= $rs['ofc_amount']; }else { $ofc_amount= '-';}
          			if($rs['ofc_transfer_date']){ $ofc_transfer_date= $rs['ofc_transfer_date']; }else { $ofc_transfer_date= '-';}
          			if($rs['name']){ $name= $rs['name']; }else { $name= '-';}
          			if($rs['ofc_remark']){ $ofc_remark= $rs['ofc_remark']; }else { $ofc_remark= '-';}
          			$row = array();
          			$row[] = stripslashes($i-1);
          			$row[] = stripslashes($transferfor);
          			$row[] = stripslashes($statefor);
          			$row[] = stripslashes($ofc_amount);        
          			$row[] = stripslashes($ofc_transfer_date);
          			$row[] = stripslashes($name);
          			$row[] = stripslashes($ofc_remark); 
          			$data[] = $row;
          			$i++;
          		}
          		function filterData(&$str){
          			$str = preg_replace("/\t/", "\\t", $str);
          			$str = preg_replace("/\r?\n/", "\\n", $str);
          			if(strstr($str, '"')) $str = '"' . str_replace('"', '""', $str) . '"';
          		}
          		$fileName = "office-expense-report.xls"; 
          		header("Content-Disposition: attachment; filename=\"$fileName\"");
          		header("Content-Type: application/vnd.ms-excel");
          		$flag = false;
          		foreach($data as $row) {
          			if(!$flag) {
          				echo implode("\t", array_keys($row));
          				$flag = true;
          			}
          			array_walk($row, 'filterData');
          			echo implode("\t", array_values($row)) . "\n";
          		}
          		exit;
          	}
          	if($params['type'] == 'id' && $params['order'] == 'desc' ) { 
          		$this->view->id_order = 'asc';  
          	}
          	else if($params['type'] == 'id' && $params['order'] == 'asc' ) { 
          		$this->view->id_order = 'desc';  }
          	}
          	/*-------------------------METHOD-START : CREATE NEW EXPENSE-----------------------------*/
	public function createNewExpenseAction(){
	    $profiler = $this->dbAdapter->getProfiler();
        $profiler->setEnabled(true);
  
		try {
			$this->checklogin(); 
			$this->view->messages      = $messages   = $this->_flashMessenger->getMessages();  
			$this->view->params        = $params     = $this->getRequest()->getParams();
			$master_model = new Application_Model_Master();
// 			if($this->role_type != 1 || $this->role_type != 4 || $this->role_type != 2){
// 				// $this->_redirect('/authlogout/logout');
// 				echo 'Invalid Access';exit;
// 			} 
			$companiesQuery = $this->dbAdapter->select()
			->from("tbl_companies", array("*"))
			->where("is_active = 1");
			$this->view->companies = $expenseTypeListResult = $this->dbAdapter->fetchAll($companiesQuery);
        
			$expenseTypeListQuery = $this->dbAdapter->select()
			->from("tbl_expense_type_master", array("id","expense_type"))
			->where("status = 1");
			$this->view->expenseTypeList = $expenseTypeListResult = $this->dbAdapter->fetchAll($expenseTypeListQuery);
			if($this->getRequest()->isPost()){
				if($params['expenseTypeName']=='Site Expense'){
					if($params['siteExpenseDateOfTransfer'] == ''){
						$params['error'] = "Transfer Date missing. Please select transfer date.";
						$this->view->params = $params;
					} else if($params['poNumber'] == ''){
						$params['error'] = "PO number missing. Please select PO number.";
						$this->view->params = $params;
					} else if($params['siteId'] == ''){
						$params['error'] = "Site ID missing. Please select site ID."; 
						$this->view->params = $params;
					} else if($params['siteExpenseTransferAmount'] == ''){
						$params['error'] = "Transfer amount missing. Please enter transfer amount.";
						$this->view->params = $params;
					} else if($params['amountTransferTo'] == ''){
						$params['error'] = "Transfer to missing. Please select transfer to.";
						$this->view->params = $params;
					}else if($params['payment_mode_id'] == ''){
						$params['error'] = "Payment Mode missing. Please select Payment Mode.";
						$this->view->params = $params;
					}else if($params['bank_account_id'] == ''){
						$params['error'] = "Bank Account missing. Please select bank account.";
						$this->view->params = $params;
					} else {  	
					    $billNo = isset($params['siteExpenseBillNumber']) && $params['siteExpenseBillNumber'] !== ''
                            ? $params['siteExpenseBillNumber']
                            : null;
						$insertData = array();
						$stateForQuery = "SELECT operating_unit as operating_unit FROM tbl_po_details WHERE po_no = '".$params['poNumber']."' and is_deleted = 0";
						$stateForResult = $this->dbAdapter->fetchRow($stateForQuery);
						$company_query ="Select * from tbl_companies where id = ".$params['company_id'];
						$companydata = $this->dbAdapter->fetchRow($company_query);
						$voucher_query ="Select * from tbl_site_expense where company_id = ".$params['company_id']." Order By created_at DESC";
						// echo '<pre>';print_r($voucher_query);exit;
						$voucherData = $this->dbAdapter->fetchRow($voucher_query);
						$insertData['company_id']          = $params['company_id'];
						$insertData['po_no']          = $params['poNumber'];
						$insertData['bill_no']          = $billNo;

						$insertData['site_id']        = $params['siteId'];
						$insertData['state_for']      = $stateForResult['operating_unit'];
						$insertData['amount']         = $params['siteExpenseTransferAmount'];
						$insertData['transfer_date']  = $params['siteExpenseDateOfTransfer'];
						$transfer_to = explode('-', $params['amountTransferTo']);
						$insertData['transfer_to_name']  = $transfer_to[0];
						$insertData['allocation_type']  = $transfer_to[1];
						$insertData['transfered_to']  = $transfer_to[2];
						if ($params['siteExpenseTransferRemark']) {
							$insertData['remark']         = $params['siteExpenseTransferRemark'];
						}
						$insertData['payment_mode_id']          = $params['payment_mode_id'];
						$insertData['bank_account_id']          = $params['bank_account_id'];
						$insertData['debit_account_id']          = $params['debit_account_id'];
						if(!$voucherData){
							$insertData['voucher_number']          = $companydata['company_alias']."/1";
						}else{
							$tempVoucher = explode('/', $voucherData['voucher_number']);
							$session_date = date('y')."-".(date('y')+1);
							$insertData['voucher_number']          = $companydata['company_alias']."/".$session_date."/".($tempVoucher[1]+1);

						}
						$insertData['created_at']     = date('Y-m-d H:i:s');
						$insertData['created_by']     = $this->id;
						// echo '<pre>';print_r($insertData);exit;
						$this->dbAdapter->insert('tbl_site_expense', $insertData);
						$lastInsertId = $this->dbAdapter->lastInsertId();
						$expenseDetailsData = array();
						foreach ($params['expense_in_id'] as $key => $value) {
							$expenseDetailsData['site_expense_id']  = $lastInsertId;
							$expenseDetailsData['expense_type_id']  = $params['expenseType'];
							$expenseDetailsData['expense_type']     = $params['expenseTypeName'];
							$expenseDetailsData['expense_in_id']    = $value;
							$expenseInName                          = $master_model->getExpenseInNameById($value);
							$expenseDetailsData['expense_in']       = $expenseInName['expense_in_type'];
							$expenseDetailsData['expense_for_id']   = $params['expense_for_id'][$key];
							$expenseForName                         = $master_model->getExpenseForNameById($params['expense_for_id'][$key]);
							$expenseDetailsData['expense_for']      = $expenseForName['expense_transfer_for'];
							$expenseDetailsData['spent_amount']     = $params['spentAmount'][$key];
							if ($params['expense_remark'][$key]) {
								$tempArr =explode('-',$params['expense_remark'][$key] );
								$expenseDetailsData['required_doc_type']   = $tempArr[0];
							}
							if($params['spentRemark'][$key]){
								$expenseDetailsData['spent_remark']   = $params['spentRemark'][$key];
							}
							if (!empty($_FILES['bill_attachment']['name'][$key]) || $_FILES['bill_attachment']['name'][$key] != "") {
								$targetFile = $_FILES['bill_attachment']['name'][$key];
								$targetDir = "uploads/expense/site_expense/".$targetFile;
								move_uploaded_file($_FILES['bill_attachment']['tmp_name'][$key], $targetDir);
								$expenseDetailsData['attachment_path'] = "/uploads/expense/site_expense/".$_FILES['bill_attachment']['name'][$key];
							} else {
								$expenseDetailsData['attachment_path'] = '';
							}
							$expenseDetailsData['expense_date']     = $params['date'][$key];
							$expenseDetailsData['created_at']       = date('Y-m-d H:i:s');
							$expenseDetailsData['created_by']       = $this->id;
							// echo '<pre>';print_r($expenseDetailsData);

							$this->dbAdapter->insert("tbl_site_expense_details", $expenseDetailsData);
						}
						$balanceData = $data =array();
						$data = $this->dbAdapter->fetchRow("select balance from tbl_user_balance where user_id = ".$transfer_to[2]." order by created DESC");
						$balanceData['user_id'] = $transfer_to[2];
						$balanceData['user_type'] = $transfer_to[1];
						$balanceData['user_name'] =$transfer_to[0];
						$balanceData['debit'] =$params['siteExpenseTransferAmount'];;
						$balanceData['credit'] = 0;
						$balanceData['balance'] =$data['balance']-$params['siteExpenseTransferAmount'];
						//$this->dbAdapter->insert("tbl_user_balance", $balanceData);
						$this->_flashMessenger->addMessage(array('success' => 'Site Expense has been saved successfully.'));
						$this->_redirect('/expense/'); 
					} /* end of check else */
				}
				/* for office expense */
				if($params['expenseTypeName']=='Office Expense'){
					if($params['officeExpenseDateOfTransfer'] == ''){
						$params['error'] = "Transfer Date missing. Please select transfer date.";
						$this->view->params = $params;
					} else if($params['officeExpenseBillNumber'] == ''){
						$params['error'] = "Bill/Attachment Number missing. Please enter bill/attachment number.";
						$this->view->params = $params;
					} else if($params['officeExpenseTransferTo'] == ''){
						$params['error'] = "Transfer to missing. Please select transfer to.";
						$this->view->params = $params;
					} else if($params['officeExpenseTransferAmount'] == ''){
						$params['error'] = "Transfer amount missing. Please enter transfer amount.";
						$this->view->params = $params;
					} else {
						$insertData = array();
						$company_query ="Select * from tbl_companies where id = ".$params['company_id'];
						$companydata = $this->dbAdapter->fetchRow($company_query);
						$voucher_query ="SELECT * FROM `tbl_office_expense` WHERE company_id = ".$params['company_id']." ORDER BY created_at DESC";
						$voucherData = $this->dbAdapter->fetchRow($voucher_query);
						$insertData['company_id']          = $params['company_id'];
						$insertData['expense_type_id']= $params['expenseType'];
						$insertData['amount']         = $params['officeExpenseTransferAmount'];

						$insertData['transfer_date']  = $this->dateConverter($params['officeExpenseDateOfTransfer']);
						$insertData['transfered_to']  = $params['officeExpenseTransferTo'];
						$insertData['remark']         = $params['officeExpenseTansferRemark'];
						$insertData['payment_mode_id']          = $params['payment_mode_id'];
						$insertData['bank_account_id']          = $params['bank_account_id'];
						$insertData['debit_account_id']          = $params['debit_account_id'];
						if(!$voucherData){
							$insertData['voucher_number']          = $companydata['company_alias']."/1";
						}else{
							$tempVoucher = explode('/', $voucherData['voucher_number']);
							// echo '<pre>';print_r($tempVoucher);exit;

							$session_date = date('y')."-".(date('y')+1);
							$insertData['voucher_number']          = $companydata['company_alias']."/".$session_date."/".($tempVoucher[2]+1);

						}
				// 		 echo '<pre>';print_r($insertData);exit;
						$insertData['bill_number']    = $params['officeExpenseBillNumber'];
						$insertData['created_at']     = date('Y-m-d H:i:s');
						$insertData['created_by']     = $this->id;
						if( isset( $_FILES['officeExpenseAttachment']['error'] ) ){
							if( $_FILES['officeExpenseAttachment']['error'] == '0' ){
								$targetFile = $_FILES['officeExpenseAttachment']['name'];
								$targetDir = "uploads/expense/office_expense/".$targetFile;
								move_uploaded_file($_FILES['officeExpenseAttachment']['tmp_name'], $targetDir);
								$insertData['attachment'] = "/uploads/expense/office_expense/".$_FILES['officeExpenseAttachment']['name'];
							}else {
								$insertData['attachment'] = "";  
							}
						}
						 ///echo '<pre>';print_r($session_date);exit;
						$this->dbAdapter->insert('tbl_office_expense', $insertData);
						$lastInsertId = $this->dbAdapter->lastInsertId();
						$expenseDetailsData = array();
						foreach ($params['expense_in_id'] as $key => $value) {
							$expenseDetailsData['expense_type_id']  = $params['expenseType'];
							$expenseDetailsData['expense_id']       = $lastInsertId;
							$expenseDetailsData['expense_in_id']    = $value;
							$expenseDetailsData['expense_for_id']   = $params['expense_for_id'][$key];
							$expenseDetailsData['spent_amount']     = $params['spentAmount'][$key];
							if ($params['spentRemark'][$key]) {
								$expenseDetailsData['spent_remark']   = $params['spentRemark'][$key];
							}
							$expenseDetailsData['created_at']       = date('Y-m-d H:i:s');
							$expenseDetailsData['created_by']       = $this->id;
							$this->dbAdapter->insert("tbl_expense_details", $expenseDetailsData);
						}
						$balanceData = $data =array();
						$data = $this->dbAdapter->fetchRow("select balance from tbl_user_balance where user_id = ".$params['officeExpenseTransferTo'] ." order by created DESC ");
						$name =$this->dbAdapter->fetchRow("select name from tbl_user where id = ".$params['officeExpenseTransferTo']);
						$balanceData['user_id'] = $params['officeExpenseTransferTo'];
						$balanceData['user_type'] ='user';
						$balanceData['user_name'] = $name['name'];
						$balanceData['debit'] =$insertData['amount'] ;
						$balanceData['credit'] = 0;
						$balanceData['balance']= $data['balance']-$insertData['amount'] ;
						$this->dbAdapter->insert("tbl_user_balance", $balanceData);
						$this->_flashMessenger->addMessage(array('success' => 'Office Expense has been saved successfully.'));
						$this->_redirect('/expense/office-expenses'); 
					}
				}
			}
		} catch(Exception $e){
		   $last = $profiler->getLastQueryProfile();
            echo $last->getQuery();
            print_r($last->getQueryParams());
            
 
			echo $e->getMessage();
			exit;
		}
	}
          	/*-------------------------METHOD-END : CREATE NEW EXPENSE-----------------------------*/
          	/*-------------------------METHOD-START : INVOICE REPORT-----------------------------*/

          	/*-------------------------METHOD-END : INVOICE REPORT-----------------------------*/

          	/*-------------------------METHOD-START : INVOICE VIEW STATUS CHANGE-----------------------------*/

          	/*-------------------------METHOD-END : INVOICE VIEW STATUS CHANGE-----------------------------*/

          	/*-------------------------METHOD-START : EDIT OFFICE EXPENSE-----------------------------*/
          	public function editOfficeExpenseAction()
          	{
          		try {
          			$this->checklogin();
          			$params = $this->getRequest()->getParams();
          			$checkExpenseIdExistsQuery = $this->dbAdapter->select()
          			->from('tbl_office_expense', array('id'))
          			->where('md5(id) = ?', $params['expense-id'])
          			->where('is_deleted = 0');
          			$checkExpenseIdExistsResult = $this->dbAdapter->fetchRow($checkExpenseIdExistsQuery); 
          			if ($checkExpenseIdExistsResult) {
          				$userListQuery = $this->dbAdapter->select()
          				->from('tbl_user', array('id','name'))
          				->where('status = 1')
          				->order('name asc');
          				$this->view->userList = $userListResult = $this->dbAdapter->fetchAll($userListQuery);
          				$getExpenseQuery = $this->dbAdapter->select()
          				->from('tbl_office_expense', array('*'))
          				->where('md5(id) = ?', $params['expense-id'])
          				->where('is_deleted = 0');
          				$this->view->expense = $getExpenseResult = $this->dbAdapter->fetchRow($getExpenseQuery);
          				$getExpenseDetailsQuery = $this->dbAdapter->select()
          				->from('tbl_expense_details', array('*'))
          				->where('md5(expense_id) = ?', $params['expense-id']);
          				$this->view->epenseDetails = $getExpenseDetailsResult = $this->dbAdapter->fetchAll($getExpenseDetailsQuery);
      // echo "<pre>";
      // print_r($getExpenseResult);
      // echo "<pre>";
      // print_r($getExpenseDetailsResult);
      // exit;
          			} else {
          				echo 'Access Denied! Please try again.';
          				exit;
          			}
          		} catch(Exception $e) {
          			echo $e->getMessage();
          			exit;
          		}
          	}
          	/*-------------------------METHOD-END : EDIT OFFICE EXPENSE-----------------------------*/

          	public function newExpenseAction()
          	{
          		try {
          			$this->view->messages = $messages = $this->_flashMessenger->getMEssages();
          			$this->view->access_token                = $this->access_token;
          			$params = $this->getRequest()->getParams();

          			$expenseTypeListQuery = $this->dbAdapter->select()
          			->from("tbl_expense_type_master", array("id","expense_type"))
          			->where("status = 1");
          			$this->view->expenseTypeList = $expenseTypeListResult = $this->dbAdapter->fetchAll($expenseTypeListQuery);


          			$master_model = new Application_Model_Master();
          			if($this->role_type != 1 && $this->role_type != 4){
          				$this->_redirect('/authlogout/logout');
          			} 
          			$companiesQuery = $this->dbAdapter->select()
          			->from("tbl_companies", array("*"))
          			->where("is_active = 1");
          			$this->view->companies = $expenseTypeListResult = $this->dbAdapter->fetchAll($companiesQuery);
          			$bankAccountQuery = $this->dbAdapter->select()
          			->from("tbl_bank_accounts", array("*"))
          			->where("is_active = 1");
          			$this->view->bank_accounts = $bank_accounts = $this->dbAdapter->fetchAll($bankAccountQuery);

          			$debitAccountQuery = $this->dbAdapter->select()
          			->from("tbl_debit_account", array("*"))
          			->where("is_active = 1");
          			$this->view->debitAccount = $debitAccount = $this->dbAdapter->fetchAll($debitAccountQuery);

          			$paymentModesQuery = $this->dbAdapter->select()
          			->from("tbl_payment_modes", array("id","payment_mode"))
          			->where("is_active = 1");
          			$this->view->payment_modes = $payment_modes = $this->dbAdapter->fetchAll($paymentModesQuery);


          			$userListQuery = $this->dbAdapter->select()
          			->from("tbl_user", array("id","name"))
          			->where("status = 1")
          			->order("name asc");
          			$this->view->userList = $userListResult = $this->dbAdapter->fetchAll($userListQuery);
          			$expenseInMasterListQuery = $this->dbAdapter->select()
          			->from("tbl_expense_in_type_master", array("id","expense_in_type"))
          			->where("status = 1")
          			->where("expense_type_id = ?", $params['expense_type']);
          			$this->view->expenseInMasterList = $expenseInMasterListResult = $this->dbAdapter->fetchAll($expenseInMasterListQuery);
                	// echo '<pre>';print_r($expenseInMasterListResult);exit;


          		} catch(Exception $e){
          			echo $e->getMessage();
          			exit;
          		}
          	}
          	public function getExpenseInListAction()
          	{
          		try {
          			$response = array();
          			$params = $this->getRequest()->getParams();
          			if (isset($params['expense_type']) != "" && $params['expense_type'] == "Office Expense") {
          				$userListQuery = $this->dbAdapter->select()
          				->from("tbl_user", array("id","name"))
          				->where("status = 1")
          				->order("name asc");
          				$userListResult = $this->dbAdapter->fetchAll($userListQuery);
          				$userOptions = '<option value="">Please Select</option>';
          				foreach ($userListResult as $user) {
          					$userOptions .= '<option value="'.$user['id'].'">'.ucwords(strtolower($user['name'])).'</option>';
          				}
          				$response['userOption'] = $userOptions;
          			}
          			if ($params['expense_type_id'] != "") {
          				$expenseInMasterListQuery = $this->dbAdapter->select()
          				->from("tbl_expense_in_type_master", array("id","expense_in_type"))
          				->where("status = 1")
          				->where("expense_type_id = ?", $params['expense_type_id']);
          				$expenseInMasterListResult = $this->dbAdapter->fetchAll($expenseInMasterListQuery);
          				if ($expenseInMasterListResult) {
          					$expenseInOptions = '<option value="">Please Select</option>';
          					foreach ($expenseInMasterListResult as $expenseInMasterList) {
          						$expenseInOptions .= '<option value="'.$expenseInMasterList['id'].'">'.$expenseInMasterList['expense_in_type'].'</option>';
          					}
          					$response['flag'] = true;
          					$response['expenseOption'] = $expenseInOptions;
          				} else {
          					$response['flag'] = false;
          					$response['title'] = "No Result Found!";
          					$response['message'] = "Please try after updating the expense master.";
          				}
          			} else {
          				$response['flag'] = false;
          				$response['title'] = "Expense Type Missing!";
          				$response['message'] = "Please select expense type.";
          			}
          		} catch(Exception $e){
          			$response['flag'] = false;
          			$response['title'] = "Internal Error!";
          			$response['message'] = $e->getMessage();
          		}
          		echo json_encode($response);
          		exit;
          	}
          	public function siteExpenseFormAction()
          	{
          		try { 
          			$this->checklogin();
          			$params = $this->getRequest()->getParams();

          			$companiesQuery = $this->dbAdapter->select()
          			->from("tbl_companies", array("*"))
          			->where("is_active = 1");
          			$this->view->companies = $expenseTypeListResult = $this->dbAdapter->fetchAll($companiesQuery);

          			$bankAccountQuery = $this->dbAdapter->select()
          			->from("tbl_bank_accounts", array("*"))
          			->where("is_active = 1");
          			$this->view->bank_accounts = $bank_accounts = $this->dbAdapter->fetchAll($bankAccountQuery);

          			$debitAccountQuery = $this->dbAdapter->select()
          			->from("tbl_debit_account", array("*"))
          			->where("is_active = 1");
          			$this->view->debitAccount = $debitAccount = $this->dbAdapter->fetchAll($debitAccountQuery);

          			$paymentModesQuery = $this->dbAdapter->select()
          			->from("tbl_payment_modes", array("id","payment_mode"))
          			->where("is_active = 1");
          			$this->view->payment_modes = $payment_modes = $this->dbAdapter->fetchAll($paymentModesQuery);


          			$poNumberListQuery = $this->dbAdapter->select()
          			->from("tbl_po_details", array("id","po_no"))
          			->where('is_deleted=?',0)
          			->order("po_no asc");
          			$this->view->poNumbers = $poNumberListResult = $this->dbAdapter->fetchAll($poNumberListQuery);
          			$site_documents_query = "SELECT * FROM `tbl_site_document` WHERE status =1";
          			$this->view->site_document =$site_documents=$this->dbAdapter->fetchAll($site_documents_query);
          			// echo '<pre>';print_r($site_documents);exit;
          			$expenseInMasterListQuery = $this->dbAdapter->select()
          			->from("tbl_expense_in_type_master", array("id","expense_in_type"))
          			->where("status = 1")
          			->where("expense_type_id = ?", $params['expense_type']);
          			$this->view->expenseInMasterList = $expenseInMasterListResult = $this->dbAdapter->fetchAll($expenseInMasterListQuery);
          			$getUserListQuery = $this->dbAdapter->select()
          			->from('tbl_user', array('id','name'))
          			->where('status = 1');
          		// 	->where('role_type != 1');
          			$this->view->userList = $getUserListResult = $this->dbAdapter->fetchAll($getUserListQuery);
          			$getTransporterListQuery = $this->dbAdapter->select()
          			->from('tbl_transporter_master', array('id','transporter_name'))
          			->where('is_active = 1');
          			$this->view->transporterList = $getTransporterListResult = $this->dbAdapter->fetchAll($getTransporterListQuery);
          			$getMaterialSupplierListQuery = $this->dbAdapter->select()
          			->from('tbl_material_supplier', array('id','supplier_name'))
          			->where('status = 1');
          			$this->view->materialSupplierList = $getMaterialSupplierListResult = $this->dbAdapter->fetchAll($getMaterialSupplierListQuery);
          			$getProductSupplierListQuery = $this->dbAdapter->select()
          			->from('tbl_suppliers', array('id','name'))
          			->where('is_active = 1');
          			$this->view->psList = $getProductSupplierListResult = $this->dbAdapter->fetchAll($getProductSupplierListQuery);
          			$getVendorListQuery = $this->dbAdapter->select()
          			->from('tbl_vendor', array('id','vendor_name','contact_person'))
          			->where('status = 1');
          			$this->view->vendorList = $getvendorListResult = $this->dbAdapter->fetchAll($getVendorListQuery);
          		} catch(Exception $e){
          			echo $e->getMessage();
          			exit;
          		}
          		$this->_helper->layout()->disableLayout();
          	}
          	public function officeExpenseFormAction()
          	{
          		try { 
          			$this->checklogin();
          			$params = $this->getRequest()->getParams();

          			$companiesQuery = $this->dbAdapter->select()
          			->from("tbl_companies", array("*"))
          			->where("is_active = 1");
          			$this->view->companies = $expenseTypeListResult = $this->dbAdapter->fetchAll($companiesQuery);

          			$bankAccountQuery = $this->dbAdapter->select()
          			->from("tbl_bank_accounts", array("*"))
          			->where("is_active = 1");
          			$this->view->bank_accounts = $bank_accounts = $this->dbAdapter->fetchAll($bankAccountQuery);

          			$debitAccountQuery = $this->dbAdapter->select()
          			->from("tbl_debit_account", array("*"))
          			->where("is_active = 1");
          			$this->view->debitAccount = $debitAccount = $this->dbAdapter->fetchAll($debitAccountQuery);

          			$paymentModesQuery = $this->dbAdapter->select()
          			->from("tbl_payment_modes", array("id","payment_mode"))
          			->where("is_active = 1");
          			$this->view->payment_modes = $payment_modes = $this->dbAdapter->fetchAll($paymentModesQuery);


          			$userListQuery = $this->dbAdapter->select()
          			->from("tbl_user", array("id","name"))
          			->where("status = 1")
          			->order("name asc");
          			$this->view->userList = $userListResult = $this->dbAdapter->fetchAll($userListQuery);
          			$expenseInMasterListQuery = $this->dbAdapter->select()
          			->from("tbl_expense_in_type_master", array("id","expense_in_type"))
          			->where("status = 1")
          			->where("expense_type_id = ?", $params['expense_type']);
          			$this->view->expenseInMasterList = $expenseInMasterListResult = $this->dbAdapter->fetchAll($expenseInMasterListQuery);
          			// echo '<pre>';print_r($params);exit;
          			$this->_helper->layout()->disableLayout();
          		} catch(Exception $e){
          			echo $e->getMessage();
          			exit;
          		}
          	}
          	public function getExpenseForByExpenseInAction()
          	{
          		try {
          			$this->checklogin();
          			$response = array();
          			$params = $this->getRequest()->getParams();
          			if (!empty($params['expense_in_id'])) {
          				$expenseTransferMasterListQuery = $this->dbAdapter->select()
          				->from("tbl_expense_transfer_for_master", array("id","expense_transfer_for"))
          				->where("expense_in_id = ?", $params['expense_in_id']);
          				$expenseTransferMasterListResult = $this->dbAdapter->fetchAll($expenseTransferMasterListQuery);
          				if ($expenseTransferMasterListResult) {
          					$options = '<option value="">Please Select</option>';
          					foreach ($expenseTransferMasterListResult as $expenseIn) {
          						$options .= '<option value="'.$expenseIn['id'].'">'.$expenseIn['expense_transfer_for'].'</option>';
          					}
          					$response['flag'] = true;
          					$response['option'] = $options;
          				} else {
          					$response['flag'] = false;
          					$response['title'] = "No Data Found!";
          					$response['message'] = "Please update expense for master data.";
          				}
          			} else {
          				$response['flag'] = false;
          				$response['title'] = "Expense In Id Missing!";
          				$response['message'] = "Please try again after refreshing the page.";
          			}
          		} catch(Exception $e){
          			$response['flag'] = false;
          			$response['title'] = "Internal System Error!";
          			$response['message'] = $e->getMessage();
          		}
          		echo json_encode($response);
          		exit;
          	}
          	public function getSiteDocumentsAction()
          	{
          		try {
          			$this->checklogin();
          			$response = array();
          			$params = $this->getRequest()->getParams();
          			if (!empty($params['expense_remark'])) {
          				$site_documents_query = $this->dbAdapter->select()
          				->from("tbl_site_document", array("*"))
          				->where("id = ?", $params['expense_remark']);
          				$site_documents = $this->dbAdapter->fetchAll($site_documents_query);
          				if ($site_documents) {
          					foreach ($site_documents as $site_document) {
          						$options .= '<option value="'.$site_document['id'].'">'.$site_document['document_name'].'</option>';
          						$response['is_required']=$site_document['is_required'];

          					}
          					$response['flag'] = true;
          					$response['option'] = $options;

          				} else {
          					$response['flag'] = false;
          					$response['title'] = "No Data Found!";
          					$response['message'] = "Please update site document type for master data.";
          				}
          			} else {
          				$response['flag'] = false;
          				$response['title'] = "Expense In Id Missing!";
          				$response['message'] = "Please try again after refreshing the page.";
          			}
          		} catch(Exception $e){
          			$response['flag'] = false;
          			$response['title'] = "Internal System Error!";
          			$response['message'] = $e->getMessage();
          		}
          		echo json_encode($response);
          		exit;
          	}
          	public function getSiteDocumentForListAction()
          	{
          		try {
          			$this->checklogin();
          			$response = array();
          			$params = $this->getRequest()->getParams();
          			$site_documents_query = $this->dbAdapter->select()
          			->from("tbl_site_document", array("*"))
          			->where("status = ?", 1);
          			$site_documents = $this->dbAdapter->fetchAll($site_documents_query);
          			if ($site_documents) {
          				$options = '<option value="">Select</option>';
          				foreach ($site_documents as $site_document) {
          					$options .= '<option value="'.$site_document['id'].'-'.$site_document['is_required'].'">';
          					$options .=  $site_document['document_name'].'</option>';
          				}
          					// echo '<pre>';print_r($options);exit;
          				$response['flag'] = true;
          				$response['option'] = $options;
          			} else {
          				$response['flag'] = false;
          				$response['title'] = "No Data Found!";
          				$response['message'] = "Please update site document form master data.";
          			}

          		} catch(Exception $e){
          			$response['flag'] = false;
          			$response['title'] = "Internal System Error!";
          			$response['message'] = $e->getMessage();
          		}
          		echo json_encode($response);
          		exit;
          	}
          	public function getAllPoAction(){
          		$role_type =  $this->_getParam('site_type_id'); 
          		$sql_po = "SELECT po_no , amount FROM tbl_expense_report WHERE description LIKE '%".$role_type."%' ";
          		$qry_po = $this->dbAdapter->fetchAll($sql_po);
          		$role_List[] = array("value"=>"",'text'=>"---Select PO Number---");
          		foreach($qry_po as $key){
          			if($key['amount']!=''){
          				$amount = " "."(".$key['amount'].")";
          			}else{ $amount = ""; }
          			$role_List[] = array("value"=>$key['po_no'],"text"=>$key['po_no'].$amount);
          		}
          		$this->getHelper('Layout')->disableLayout();
          		$this->getHelper('ViewRenderer')->setNoRender();
          		$this->getResponse()->setHeader('Content-Type', 'application/json');
          		echo json_encode(array('options'=>$role_List));
          		return; 
          	}

        //   	function dateConverter($var){
        //   		$date = explode('/', $var);
        //   		$final_date = $date['2'].'-'.$date['1'].'-'.$date['0'];
        //   		return $final_date;
        //   	}
        
        function dateConverter($var){
    if (empty($var)) {
        return null;
    }

    // If already MySQL format
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $var)) {
        return $var;
    }

    $date = DateTime::createFromFormat('d/m/Y', $var);
    return $date ? $date->format('Y-m-d') : null;
}
          	/*---------------------------import master-----------------------------------------*/
          	public function importExpenseAction(){
          		$this->checklogin(); 
          		$auth                  = Zend_Auth::getInstance();
          		$authStorage           = $auth->getStorage();
          		$this->WebLoginID      = $authStorage->read()->WebLoginID;
          		$this->id              = $authStorage->read()->id;
          		$this->Role            = $authStorage->read()->Role; 
          		$this->access_token    = $authStorage->read()->access_token;
          		$this->role_type       = $authStorage->read()->role_type;
          		$params                = $this->view->params = $this->getRequest()->getParams();
          		$this->view->messages  = $this->_flashMessenger->getMessages(); 
          		if($this->role_type!='1'){
          			$this->_redirect('/authlogout/logout');
          		}

          		if(isset($_FILES['import_file']['error'])){      
          			if($_FILES['import_file']['error'] > 0){
          				$this->view->errorMessage1 = "<span style='color:red; font-weight:bold;'>Please! Select a File.!</span>";
          			}else{

          				$allowed = array("xls" => "application/vnd.ms-excel", 
          					"xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); 
          				$filename = $_FILES["import_file"]["name"];
          				$filetype = $_FILES["import_file"]["type"];
          				$filesize = $_FILES["import_file"]["size"]; 
          				$ext = pathinfo($filename, PATHINFO_EXTENSION);
          				if(!array_key_exists($ext, $allowed)){
          					$this->view->errorMessage = "<span style='color:red; font-weight:bold;'>This file is not an accepted file type.</span>";
          				}
          				$maxsize = 200000 * 60;
          				if($filesize > $maxsize) {
          					$this->view->errorMessage1 = "<span style='color:red; font-weight:bold;'>File size is larger than the allowed 10MB limit.</span>";
          				}    
          				if(in_array($filetype, $allowed)){        
          					@move_uploaded_file($_FILES["import_file"]["tmp_name"], "PHPExcleReader/" . $_FILES["import_file"]["name"]);
          					/** Include path **/
          					set_include_path(get_include_path() . PATH_SEPARATOR . 'PHPExcleReader/Classes/');
          					/** PHPExcel_IOFactory */
          					include 'PHPExcel/IOFactory.php';
            $inputFileName = 'PHPExcleReader/'.$filename;  // File to read
            //echo $inputFileName; exit;
            $query = $this->dbAdapter->select() ->from('INFORMATION_SCHEMA.COLUMNS',array('COLUMN_NAME'))->where('TABLE_NAME =?','tbl_expense_report');
            $res = $this->dbAdapter->fetchAll($query);             
            try {

            	$objPHPExcel = PHPExcel_IOFactory::load($inputFileName);

            } catch(Exception $e) {
            	die('Error loading file "'.pathinfo($inputFileName,PATHINFO_BASENAME).'": '.$e->getMessage());
            }

            $sheetData = $objPHPExcel->getActiveSheet()->toArray(null,true,true,true); 
    /* foreach ($sheetData as $item) {
     if($res[1]['COLUMN_NAME']!=$item['A']  || 
        $res[2]['COLUMN_NAME']!=$item['B']  || 
        $res[3]['COLUMN_NAME']!=$item['C']  || 
        $res[4]['COLUMN_NAME']!=$item['D']  || 
        $res[5]['COLUMN_NAME']!=$item['E']  ||
        $res[6]['COLUMN_NAME']!=$item['F']  || 
        $res[7]['COLUMN_NAME']!=$item['G']  || 
        $res[8]['COLUMN_NAME']!=$item['H']  || 
        $res[9]['COLUMN_NAME']!=$item['I']  || 
        $res[10]['COLUMN_NAME']!=$item['J'] ||  
        $res[11]['COLUMN_NAME']!=$item['K'] ||
        $res[12]['COLUMN_NAME']!=$item['L'] || 
        $res[13]['COLUMN_NAME']!=$item['M'] || 
        $res[14]['COLUMN_NAME']!=$item['N'] || 
        $res[15]['COLUMN_NAME']!=$item['0']){
      //$this->view->errorMessage = "<span style='color:red; font-weight:bold;'>
      //Miss match column name!</span>";
      $this->_helper->flashMessenger('Miss match column name!');
      $this->_redirect('/expense/import-expense');
                          }   
                      } */ 
          //echo "<pre>"; print_r($sheetData); exit;
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
                      			$masterDataArray['acknowledgement']         = trim($rec['N']);
                      			$masterDataArray['change_request_status']   = trim($rec['O']);
                      			$this->dbAdapter->insert('tbl_expense_report', $masterDataArray);

                      			$split_array = explode('-',$rec['E']);
                      			for( $l=0; $l<sizeof($split_array); $l++ ){
                      				if( $l != '0' ){
                      					$siteArray['po_no']   =trim($rec['A']);
                      					$siteArray['order_date']   =date('Y-m-d H:i', strtotime(trim($rec['F'])));
                      					$siteArray['site_id']   = $split_array[$l];
                      					$this->dbAdapter->insert('tbl_po_sites', $siteArray);
                      				}
                      			}
                      		}
                      	}
                      	$i++;
                      }
                      if($i > 1) {
                      	$this->_helper->flashMessenger("<span style='color:green; font-weight:bold;'>Data Imported successfully for.!</span>");
                      	$this->_redirect('/expense/import-expense');  
                      }                         
                  }   /* end of in array */    
              } /* end of else */
          }    /* end of isset */
      }





      /*-----------------------------------expense dashboard-------------------------------------------*/
      public function expenseDashboardAction(){
      	$this->checklogin(); 
      	$auth                  = Zend_Auth::getInstance();
      	$authStorage           = $auth->getStorage();
      	$this->WebLoginID      = $authStorage->read()->WebLoginID;
      	$this->id              = $authStorage->read()->id;
      	$this->Role            = $authStorage->read()->Role;
      	$this->role_type       = $authStorage->read()->role_type; 
      	$params                = $this->view->params = $this->getRequest()->getParams(); 
      	$this->view->totalnum  = $params['page'];
      	$this->view->messages  = $this->_flashMessenger->getMessages(); 
      	$user = new Application_Model_User();
      	date_default_timezone_set('Asia/Calcutta');
      	if($this->role_type!='1'){
      		$this->_redirect('/authlogout/logout');
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
      			array_push($yearlySiteExpense, array($value."-".$year,$site_expense_result['total']));
      		}else{
      			array_push($yearlySiteExpense, array($value."-".$year,0));
      		}
      	}
      	$this->view->yearlySiteExpense = $yearlySiteExpense;

      	$yearlyOfficeExpense = array();
      	foreach ($months as $key => $value) {
      		$office_expense_query = "select sum(amount) as total from tbl_office_expense where is_deleted =0 and transfer_date like '%".$year.'-'.$key."%'";
      		$office_expense_result = $this->dbAdapter->fetchRow($office_expense_query);
      		if($office_expense_result && $office_expense_result['total'] > 0){
      			array_push($yearlyOfficeExpense, array($value."-".$year,$office_expense_result['total']));
      		}else{
      			array_push($yearlyOfficeExpense, array($value."-".$year,0));
      		}
      	}	

      	$this->view->yearlyOfficeExpense = $yearlyOfficeExpense;

      	$data_sites = array();
      	foreach ($months as $key => $value) {
      		$sql_pending_sites ="SELECT site_id FROM `tbl_site_allocation`where site_completion_status =0 and po_date LIKE '%".$year.'-'.$key."%'";
      		$site_allocation_data = $this->dbAdapter->fetchAll($sql_pending_sites);	
      		if($site_allocation_data){
      			$data_sites= array_combine($value."-".$year,$site_allocation_data);
      		}else{
      			$data_sites = array_combine($value."-".$year,0);
      		}
      		// echo "<pre>";print_r($data_sites);
      	}
      	$profit_loss = array();
      	foreach ($months as $key => $value) {
      		$profit = array();
      		$sql_site_query ="select sum(tse.amount) as site_expense from tbl_site_expense tse  where
      		tse.transfer_date like '%".$year.'-'.$key."%'";
      		$site_amount = $this->dbAdapter->fetchRow($sql_site_query);	
      		$sql_office_query ="select sum(tfe.amount) as office_expense from tbl_office_expense tfe  where
      		tfe.transfer_date like '%".$year.'-'.$key."%'";
      		$office_amount = $this->dbAdapter->fetchRow($sql_office_query);
      		$sql_invoice_query ="select sum(invoice_value) as amount from tbl_punched_invoice_details   where invoice_date like '%".$year.'-'.$key."%' and status = 1";
      		$invoice_amount = $this->dbAdapter->fetchRow($sql_invoice_query);	
      		$sum =($site_amount['site_expense']+$office_amount['office_expense']);
      		if($sum || $invoice_amount['amount'] ){
      			if($invoice_amount['amount'] == 0){
      				$invoice_amount['amount']=0;
      			}
      			array_push($profit,$invoice_amount['amount'],$sum,$value."-".$year);
      		}else{
      			array_push($profit,0,0,$value."-".$year);
      		}
      		$profit_loss[] = $profit;
      		
      	}
      	// echo '<pre>';print_r($profit_loss);
      	// exit;
      	$this->view->profit_loss = $profit_loss;

      }
      /* date wise graph (site expenses) */
      public function showDateWiseSiteAndAmountAjaxAction(){
      	$this->checklogin(); 
      	$auth                   = Zend_Auth::getInstance();
      	$authStorage            = $auth->getStorage();
      	$this->role_type        = $authStorage->read()->role_type; 
      	$params                 = $this->view->params = $this->getRequest()->getParams(); 
      	$this->_helper->layout()->disableLayout();
         //$this->getHelper('ViewRenderer')->setNoRender();
      	if($this->role_type!='1'){ $this->_redirect('/authlogout/logout');  }  
      	if($params['date1']){ $date1 = $this->dateConverter($params['date1']);}
      	if($params['date2']){ $date2 = $this->dateConverter($params['date2']);}
      	if($params['zone']){ $cond .="AND state_for = '".$params['zone']."' "; }else { $cond .=""; }
      	/* date wise graph (site expenses) */
      	$mainarray = array();
      	$sqlF="SELECT amount , transfer_date, site_id as siteid FROM tbl_expense WHERE transfer_date BETWEEN  '".$date1."' AND '".$date2."' $cond ORDER BY transfer_date DESC";
      	$queryF = $this->dbAdapter->fetchAll($sqlF);
      	foreach ($queryF as $ke) {
      		$subarray = array('sum' => $ke['amount'], 'site_id' => $ke['siteid'] , 
      			'transfer_date' =>date('d/m/Y' , strtotime($ke['transfer_date'])) );
      		array_push($mainarray,$subarray);
      	}
      	$this->view->datewisesiteamount = $datewisesiteamount = $mainarray;
      } 
      /* date wise graph (office expenses) */
      public function showDateWiseOfficeAndAmountAjaxAction(){
      	$this->checklogin(); 
      	$auth                   = Zend_Auth::getInstance();
      	$authStorage            = $auth->getStorage();
      	$this->role_type        = $authStorage->read()->role_type; 
      	$params                 = $this->view->params = $this->getRequest()->getParams(); 
      	$this->_helper->layout()->disableLayout();
         //$this->getHelper('ViewRenderer')->setNoRender();
      	if($this->role_type!='1'){ $this->_redirect('/authlogout/logout');  }  
      	if($params['date1']){ $date1 = $this->dateConverter($params['date1']);}
      	if($params['date2']){ $date2 = $this->dateConverter($params['date2']);}
      	if($params['zone']){ $cond .="AND a.state_for = '".$params['zone']."' "; }else { $cond .=""; }
      	/* date wise graph (site expenses) */
      	$mainofficearray = array();
      	$sqlO="SELECT a.amount as amount , a.transfer_date as transfer_date, b.transfer_for as transferfor 
      	FROM tbl_office_expense a 
      	LEFT JOIN tbl_expense_transfer_for_master b ON (a.transfer_for = b.id) 
      	WHERE transfer_date BETWEEN  '".$date1."' AND '".$date2."' $cond ORDER BY a.transfer_date ASC";
      	$queryO = $this->dbAdapter->fetchAll($sqlO);
      	foreach ($queryO as $keo) {
      		$subofficearray = array('sum' => $keo['amount'], 'transfer_for' => $keo['transferfor'] , 
      			'transfer_date' =>date('d/m/Y' , strtotime($keo['transfer_date'])) );
      		array_push($mainofficearray,$subofficearray);
      	}
          //print_r($mainofficearray); exit;
      	$this->view->datewiseofficeamount = $datewiseofficeamount = $mainofficearray;
      }             
      public function showZoneWiseSiteAndAmountAjaxAction(){  /*zone wise*/
      	$this->checklogin(); 
      	$auth                   = Zend_Auth::getInstance();
      	$authStorage            = $auth->getStorage();
      	$this->role_type        = $authStorage->read()->role_type; 
      	$params                 = $this->view->params = $this->getRequest()->getParams(); 
      	$this->_helper->layout()->disableLayout();
         //$this->getHelper('ViewRenderer')->setNoRender();
      	if($this->role_type!='1'){ $this->_redirect('/authlogout/logout');  }  
         //print_r($params); exit;
      	if($params['zone']){ $cond .="AND state_for = '".$params['zone']."' "; }else { $cond .=""; }
         //echo $params['zone']; exit;
      	$mainzonearray = array();
      	$sqlzone="SELECT sum(amount) as sum , state_for as state_for FROM tbl_expense WHERE 1 $cond GROUP BY state_for  ORDER BY po_no DESC";
      	$queryzone = $this->dbAdapter->fetchAll($sqlzone);
      	foreach ($queryzone as $kezone) {
      		$subzonearray = array('sum' => $kezone['sum'], 'zone'=> trim(str_ireplace('BIL','',$kezone['state_for'])) );
      		array_push($mainzonearray,$subzonearray);
      	}
      	$this->view->zonewisereport = $zonewisereport = $mainzonearray;
      }     
      /* month wise region data */
      public function showMonthWiseRegionDataAction(){
      	$this->checklogin(); 
      	$auth                   = Zend_Auth::getInstance();
      	$authStorage            = $auth->getStorage();
      	$this->role_type        = $authStorage->read()->role_type; 
      	$params                 = $this->view->params = $this->getRequest()->getParams(); 
      	$this->_helper->layout()->disableLayout();
         //$this->getHelper('ViewRenderer')->setNoRender();
      	if($this->role_type!='1'){ $this->_redirect('/authlogout/logout');  }  
      	if($params['zone']){ $cond .="AND state_for = '".$params['zone']."' "; }else { $cond .=""; }
         //echo $cond; exit;
      	$main4_array = array();
      	$sqlFourth="SELECT sum(amount) as sum , MONTHNAME(date(transfer_date)) as month FROM tbl_expense WHERE 
      	YEAR(transfer_date) = YEAR(CURDATE()) $cond GROUP BY MONTH(date(transfer_date)) ";
      	$queryFourth = $this->dbAdapter->fetchAll($sqlFourth);
      	foreach ($queryFourth as $key3) {
      		$sub4_array = array('sum'=>$key3['sum'],'month'=>$key3['month']);
      		array_push($main4_array,$sub4_array);
      	}
      	$this->view->monthwiseamount = $monthwiseamount = $main4_array;
      }   
      /* on going month weekly wise region data */
      public function ongoingMonthWeeklyWiseRegionDataAction(){
      	$this->checklogin(); 
      	$auth                   = Zend_Auth::getInstance();
      	$authStorage            = $auth->getStorage();
      	$this->role_type        = $authStorage->read()->role_type; 
      	$params                 = $this->view->params = $this->getRequest()->getParams(); 
      	$this->_helper->layout()->disableLayout();
         //$this->getHelper('ViewRenderer')->setNoRender();
      	if($this->role_type!='1'){ $this->_redirect('/authlogout/logout');  }  
      	if($params['zone']){ $cond .="AND state_for = '".$params['zone']."' "; }else { $cond .=""; }
         //echo $cond; exit;
         /*$main2_array = array();
         $sqlSecond="SELECT  SUM(amount) AS sum, CONCAT(date(transfer_date), ' - ', date(transfer_date) + INTERVAL 6 DAY) AS week FROM tbl_expense WHERE MONTH(date(transfer_date)) = MONTH(NOW()) $cond GROUP BY WEEK(date(transfer_date)) ORDER BY po_no DESC";
         $querySecond = $this->dbAdapter->fetchAll($sqlSecond);
         foreach ($querySecond as $key1) {
           $sub2_array = array('sum'=>$key1['sum'],'week'=>$key1['week']);
           array_push($main2_array,$sub2_array);
         }
         $this->view->currentweekamount = $currentweekamount = $main2_array;*/
         $current_month = date('m'); $current_year = date('Y');
         
         
         if($current_month=='01' || $current_month=='03' || $current_month=='05' || $current_month=='07' || 
         	$current_month=='08' || $current_month=='10' || $current_month=='12'){
         	$main2_array = array();
         $first_week  = $current_year."-".$current_month."-"."01 AND ".$current_year."-".$current_month."-"."07";
         $second_week = $current_year."-".$current_month."-"."08 AND ".$current_year."-".$current_month."-"."14";
         $third_week  = $current_year."-".$current_month."-"."15 AND ".$current_year."-".$current_month."-"."21";
         $fourth_week = $current_year."-".$current_month."-"."22 AND ".$current_year."-".$current_month."-"."28";
         $extra_week  = $current_year."-".$current_month."-"."29 AND ".$current_year."-".$current_month."-"."31";
         $week_array  = array($first_week,$second_week,$third_week,$fourth_week,$extra_week);
         foreach ($week_array as $week_key => $week_value) {
         	$arr = explode("AND",$week_value);
         	$sqlFourth="SELECT sum(amount) as sum FROM tbl_expense WHERE transfer_date BETWEEN 
         	'".$arr[0]."' AND '".$arr[1]."' $cond ";
         	$queryFourth = $this->dbAdapter->fetchRow($sqlFourth);
         	if($queryFourth['sum']!=''){ $sum = $queryFourth['sum']; }else{ $sum ='0'; }
         	$sub2_array = array('sum' => $sum , 'week'=> str_ireplace('AND','-',$week_value) );
         	array_push($main2_array,$sub2_array);
         }
           //print_r($main2_array); exit;
         $this->view->currentweekamount = $currentweekamount = $main2_array;
     }
     if($current_month=='04' || $current_month=='06' || $current_month=='09' || $current_month=='11' ){
     	$main2_array = array();
     	$first_week  = $current_year."-".$current_month."-"."01 AND ".$current_year."-".$current_month."-"."07";
     	$second_week = $current_year."-".$current_month."-"."08 AND ".$current_year."-".$current_month."-"."14";
     	$third_week  = $current_year."-".$current_month."-"."15 AND ".$current_year."-".$current_month."-"."21";
     	$fourth_week = $current_year."-".$current_month."-"."22 AND ".$current_year."-".$current_month."-"."28";
     	$extra_week  = $current_year."-".$current_month."-"."29 AND ".$current_year."-".$current_month."-"."30";
     	$week_array  = array($first_week,$second_week,$third_week,$fourth_week,$extra_week);
     	foreach ($week_array as $week_key => $week_value) {
     		$arr = explode("AND",$week_value);
     		$sqlFourth="SELECT sum(amount) as sum FROM tbl_expense WHERE transfer_date BETWEEN 
     		'".$arr[0]."' AND '".$arr[1]."' $cond ";
     		$queryFourth = $this->dbAdapter->fetchRow($sqlFourth);
     		if($queryFourth['sum']!=''){ $sum = $queryFourth['sum']; }else{ $sum ='0'; }
     		$sub2_array = array('sum' => $sum , 'week'=> str_ireplace('AND','-',$week_value) );
     		array_push($main2_array,$sub2_array);
     	}$this->view->currentweekamount = $currentweekamount = $main2_array;
     }
     if($current_month=='02'){
     	$main2_array = array();
     	$first_week  = $current_year."-".$current_month."-"."01 AND ".$current_year."-".$current_month."-"."07";
     	$second_week = $current_year."-".$current_month."-"."08 AND ".$current_year."-".$current_month."-"."14";
     	$third_week  = $current_year."-".$current_month."-"."15 AND ".$current_year."-".$current_month."-"."21";
     	$fourth_week = $current_year."-".$current_month."-"."22 AND ".$current_year."-".$current_month."-"."28";
     	$week_array  = array($first_week,$second_week,$third_week,$fourth_week);
     	foreach ($week_array as $week_key => $week_value) {
     		$arr = explode("AND",$week_value);
     		$sqlFourth="SELECT sum(amount) as sum FROM tbl_expense WHERE transfer_date BETWEEN 
     		'".$arr[0]."' AND '".$arr[1]."' $cond ";
     		$queryFourth = $this->dbAdapter->fetchRow($sqlFourth);
     		if($queryFourth['sum']!=''){ $sum = $queryFourth['sum']; }else{ $sum ='0'; }
     		$sub2_array = array('sum' => $sum , 'week'=> str_ireplace('AND','-',$week_value) );
     		array_push($main2_array,$sub2_array);
     	} $this->view->currentweekamount = $currentweekamount = $main2_array;
     }
 }   
 /* current date wise region data */
 public function currentDateWiseRegionDataAction(){
 	$this->checklogin(); 
 	$auth                   = Zend_Auth::getInstance();
 	$authStorage            = $auth->getStorage();
 	$this->role_type        = $authStorage->read()->role_type; 
 	$params                 = $this->view->params = $this->getRequest()->getParams(); 
 	$this->_helper->layout()->disableLayout();
         //$this->getHelper('ViewRenderer')->setNoRender();
 	if($this->role_type!='1'){ $this->_redirect('/authlogout/logout');  }  
 	if($params['zone']){ $cond .="AND state_for = '".$params['zone']."' "; }else { $cond .=""; }
         //echo $cond; exit;
 	$main_array = array();
 	$sqlFirst="SELECT sum(amount) as sum , site_id as siteid FROM tbl_expense WHERE date(transfer_date) = CURDATE() 
 	$cond GROUP BY site_id ORDER BY po_no DESC";
 	$queryFirst = $this->dbAdapter->fetchAll($sqlFirst);
 	foreach ($queryFirst as $key) {
 		$sub_array = array('sum'=>$key['sum'],'site_id'=>$key['siteid']);
 		array_push($main_array,$sub_array);
 	}
 	$this->view->currentdateamount = $currentdateamount = $main_array;
 }   

 public function officeExpensesDailyMonthlyAnnualyDataAction()
 {
 	$this->checklogin();
 	$this->_helper->layout()->disableLayout();
 	$db = Zend_Db_Table::getDefaultAdapter();
 	$params = $this->getRequest()->getParams();
 	$this->view->params = $params;
 	if ($params['type'] == '2' || $params['type'] == '3') {
 		$sql = "SELECT * FROM tbl_office_expense WHERE DATE(transfer_date) = CURDATE()";
 		$query = $db->fetchAll($sql);
 		$main_array = array();
 		foreach ($query as $key) {
 			$transfer_for_sql = "SELECT transfer_for AS transfer_for FROM tbl_expense_transfer_for_master WHERE id = '".$key['transfer_for']." ' ";
 			$transfer_for_query = $db->fetchRow($transfer_for_sql);
 			$transfer_to_sql = "SELECT name AS name FROM tbl_user WHERE id = '".$key['transfered_to']."' ";
 			$tranfer_to_query = $db->fetchRow($transfer_to_sql);
 			$sub_array = array('po_no'=>$key['po_no'],'site_id'=>$key['site_id'],'transfer_for'=>$transfer_for_query['transfer_for'],'amount'=>$key['amount'],'transfer_date'=>date('d/m/Y', strtotime( $key['transfer_date']) ),'transfered_to'=>$tranfer_to_query['name'],'remark'=>$key['remark'], 'attachment'=>$key['attachment'] );
 			array_push($main_array, $sub_array);
 		}
 		$this->view->result_main_array = $main_array;
 	}
 	if ($params['type'] == '5' || $params['type'] == "6") {
 		$sql = "SELECT * FROM `tbl_office_expense` WHERE MONTH(transfer_date) = MONTH(CURDATE()) ORDER BY transfer_date DESC";
 		$query = $db->fetchAll($sql);
 		$main_array = array();
 		foreach ($query as $key) {
 			$transfer_for_sql = "SELECT transfer_for AS transfer_for FROM tbl_expense_transfer_for_master WHERE id = '".$key['transfer_for']." ' ";
 			$transfer_for_query = $db->fetchRow($transfer_for_sql);
 			$transfer_to_sql = "SELECT name AS name FROM tbl_user WHERE id = '".$key['transfered_to']."' ";
 			$tranfer_to_query = $db->fetchRow($transfer_to_sql);
 			$sub_array = array('po_no'=>$key['po_no'],'site_id'=>$key['site_id'],'transfer_for'=>$transfer_for_query['transfer_for'],'amount'=>$key['amount'],'transfer_date'=>date('d/m/Y', strtotime( $key['transfer_date']) ),'transfered_to'=>$tranfer_to_query['name'],'remark'=>$key['remark'], 'attachment'=>$key['attachment'] );
 			array_push($main_array, $sub_array);
 		}
 		$this->view->result_main_array = $main_array;
 	}
 	if ($params['type'] == '8' || $params['type'] == '9') {
 		$sql = "SELECT * FROM tbl_office_expense WHERE YEAR(transfer_date) = YEAR(CURDATE()) ORDER BY transfer_date DESC";
 		$query = $db->fetchAll($sql);
 		$main_array = array();
 		foreach ($query as $key) {
 			$transfer_for_sql = "SELECT transfer_for AS transfer_for FROM tbl_expense_transfer_for_master WHERE id = '".$key['transfer_for']." ' ";
 			$transfer_for_query = $db->fetchRow($transfer_for_sql);
 			$transfer_to_sql = "SELECT name AS name FROM tbl_user WHERE id = '".$key['transfered_to']."' ";
 			$tranfer_to_query = $db->fetchRow($transfer_to_sql);
 			$sub_array = array('po_no'=>$key['po_no'],'site_id'=>$key['site_id'],'transfer_for'=>$transfer_for_query['transfer_for'],'amount'=>$key['amount'],'transfer_date'=>date('d/m/Y', strtotime( $key['transfer_date']) ),'transfered_to'=>$tranfer_to_query['name'],'remark'=>$key['remark'], 'attachment'=>$key['attachment'] );
 			array_push($main_array, $sub_array);
 		}
 		$this->view->result_main_array = $main_array;
 	}
 }
 public function siteExpensesDailyMonthlyAnnualyDataAction()
 {
 	$this->_helper->layout()->disableLayout();
 	$db = Zend_Db_Table::getDefaultAdapter();
 	$params = $this->getRequest()->getParams();
    // print_r($params['type']);exit();
 	$this->view->params = $params;
 	if ($params['type'] == '1' || $params['type'] == '3') {
 		$sql = "SELECT * FROM tbl_expense WHERE DATE(transfer_date) = CURDATE()";
 		$query = $db->fetchAll($sql);
 		$main_array = array();
 		foreach ($query as $key) {
 			$transfer_for_sql = "SELECT transfer_for AS transfer_for FROM tbl_expense_transfer_for_master WHERE id = '".$key['transfer_for']." ' ";
 			$transfer_for_query = $db->fetchRow($transfer_for_sql);
 			$transfer_to_sql = "SELECT name AS name FROM tbl_user WHERE id = '".$key['transfered_to']."' ";
 			$tranfer_to_query = $db->fetchRow($transfer_to_sql);
 			$sub_array = array('po_no'=>$key['po_no'],'site_id'=>$key['site_id'],'transfer_for'=>$transfer_for_query['transfer_for'],'amount'=>$key['amount'],'transfer_date'=>date('d/m/Y', strtotime( $key['transfer_date']) ),'transfered_to'=>$tranfer_to_query['name'],'remark'=>$key['remark'], 'attachment'=>$key['attachment'] );
 			array_push($main_array, $sub_array);
 		}
 		$this->view->result_main_array = $main_array;
 	}
 	if ($params['type'] == '4'  || $params['type'] =='6') {
 		$sql = "SELECT * FROM `tbl_expense` WHERE MONTH(transfer_date) = MONTH(curdate()) ORDER BY transfer_date DESC";
 		$query = $db->fetchAll($sql);
 		$main_array = array();
 		foreach ($query as $key) {
 			$transfer_for_sql = "SELECT transfer_for AS transfer_for FROM tbl_expense_transfer_for_master WHERE id = '".$key['transfer_for']." ' ";
 			$transfer_for_query = $db->fetchRow($transfer_for_sql);
 			$transfer_to_sql = "SELECT name AS name FROM tbl_user WHERE id = '".$key['transfered_to']."' ";
 			$tranfer_to_query = $db->fetchRow($transfer_to_sql);
 			$sub_array = array('po_no'=>$key['po_no'],'site_id'=>$key['site_id'],'transfer_for'=>$transfer_for_query['transfer_for'],'amount'=>$key['amount'],'transfer_date'=>date('d/m/Y', strtotime( $key['transfer_date']) ),'transfered_to'=>$tranfer_to_query['name'],'remark'=>$key['remark'], 'attachment'=>$key['attachment'] );
 			array_push($main_array, $sub_array);
 		}
 		$this->view->result_main_array = $main_array;
 	}
 	if ($params['type'] == '7' || $params['type'] == '9') {
 		$sql = "SELECT * FROM tbl_expense WHERE YEAR(created) = YEAR(CURDATE()) ORDER BY transfer_date DESC";
 		$query = $db->fetchAll($sql);
 		$main_array = array();
 		foreach ($query as $key) {
 			$transfer_for_sql = "SELECT transfer_for AS transfer_for FROM tbl_expense_transfer_for_master WHERE id = '".$key['transfer_for']." ' ";
 			$transfer_for_query = $db->fetchRow($transfer_for_sql);
 			$transfer_to_sql = "SELECT name AS name FROM tbl_user WHERE id = '".$key['transfered_to']."' ";
 			$tranfer_to_query = $db->fetchRow($transfer_to_sql);
 			$sub_array = array('po_no'=>$key['po_no'],'site_id'=>$key['site_id'],'transfer_for'=>$transfer_for_query['transfer_for'],'amount'=>$key['amount'],'transfer_date'=>date('d/m/Y', strtotime( $key['transfer_date']) ),'transfered_to'=>$tranfer_to_query['name'],'remark'=>$key['remark'], 'attachment'=>$key['attachment'] );
 			array_push($main_array, $sub_array);
 		}
 		$this->view->result_main_array = $main_array;
 	}
 }
// public function totalExpensesCombinedDailyMonthlyAnnualyDataAction()
// {
//   $this->checklogin();
//   $this->_helper->layout()->disableLayout();
//   $db = Zend_Db_Table::getDefaultAdapter();
//   $params = $this->getRequest()->getParams();
//   if ($params['type'] == '3') {
//     $todaySiteExpenses_sql = "SELECT * FROM tbl_expense WHERE DATE(transfer_date) = CURDATE() ORDER BY transfer_date DESC";
//     $todaySiteExpenses_query = $db->fetchAll($todaySiteExpenses_sql);
//     $main_array_site = array();
//     foreach ($todaySiteExpenses_query as $key) {
//       $transfer_for_sql = "SELECT transfer_for AS transfer_for FROM tbl_expense_transfer_for_master WHERE id = '".$key['transfer_for']." ' ";
//       $transfer_for_query = $db->fetchRow($transfer_for_sql);
//       $transfer_to_sql = "SELECT name AS name FROM tbl_user WHERE id = '".$key['transfered_to']."' ";
//       $tranfer_to_query = $db->fetchRow($transfer_to_sql);
//       $sub_array = array('po_no'=>$key['po_no'],'site_id'=>$key['site_id'],'transfer_for'=>$transfer_for_query['transfer_for'],'amount'=>$key['amount'],'transfer_date'=>date('d/m/Y', strtotime( $key['transfer_date']) ),'transfered_to'=>$tranfer_to_query['name'],'remark'=>$key['remark'], 'attachment'=>$key['attachment'] );
//       array_push($main_array_site, $sub_array);
//     }
//     $this->view->result_main_array_site = $main_array_site;
//     $todayOfficeExpenses_sql = "SELECT * FROM tbl_office_expense WHERE DATE(transfer_date) = CURDATE() ORDER BY transfer_date DESC";
//     $todayOfficeExpenses_query = $db->fetchAll($todayOfficeExpenses_sql);
//     $main_array_office = array();
//     foreach ($todayOfficeExpenses_query as $key) {
//       $transfer_for_sql = "SELECT transfer_for AS transfer_for FROM tbl_expense_transfer_for_master WHERE id = '".$key['transfer_for']." ' ";
//       $transfer_for_query = $db->fetchRow($transfer_for_sql);
//       $transfer_to_sql = "SELECT name AS name FROM tbl_user WHERE id = '".$key['transfered_to']."' ";
//       $tranfer_to_query = $db->fetchRow($transfer_to_sql);
//       $sub_array = array('po_no'=>$key['po_no'],'site_id'=>$key['site_id'],'transfer_for'=>$transfer_for_query['transfer_for'],'amount'=>$key['amount'],'transfer_date'=>date('d/m/Y', strtotime( $key['transfer_date']) ),'transfered_to'=>$tranfer_to_query['name'],'remark'=>$key['remark'], 'attachment'=>$key['attachment'] );
//       array_push($main_array_office, $sub_array);
//     }
//     $this->view->result_main_array_office = $main_array_office;
//   } else if ($params['type'] == '6') {
//     $monthlySiteExpenses_sql = "SELECT * FROM tbl_expense WHERE MONTH(transfer_date) = MONTH(CURDATE()) ORDER BY transfer_date DESC";
//     $monthlySiteExpenses_query = $db->fetchAll($monthlySiteExpenses_sql);
//     $main_array_site = array();
//     foreach ($monthlySiteExpenses_query as $key) {
//       $transfer_for_sql = "SELECT transfer_for AS transfer_for FROM tbl_expense_transfer_for_master WHERE id = '".$key['transfer_for']." ' ";
//       $transfer_for_query = $db->fetchRow($transfer_for_sql);
//       $transfer_to_sql = "SELECT name AS name FROM tbl_user WHERE id = '".$key['transfered_to']."' ";
//       $tranfer_to_query = $db->fetchRow($transfer_to_sql);
//       $sub_array = array('po_no'=>$key['po_no'],'site_id'=>$key['site_id'],'transfer_for'=>$transfer_for_query['transfer_for'],'amount'=>$key['amount'],'transfer_date'=>date('d/m/Y', strtotime( $key['transfer_date']) ),'transfered_to'=>$tranfer_to_query['name'],'remark'=>$key['remark'], 'attachment'=>$key['attachment'] );
//       array_push($main_array_site, $sub_array);
//     }
//     $this->view->result_main_array_site = $main_array_site;
//     $monthlyOfficeExpenses_sql = "SELECT * FROM tbl_office_expense WHERE MONTH(transfer_date) = MONTH(CURDATE()) ORDER BY transfer_date DESC";
//     $monthlyOfficeExpenses_query = $db->fetchAll($monthlyOfficeExpenses_sql);
//     $main_array_office = array();
//     foreach ($monthlyOfficeExpenses_query as $key) {
//       $transfer_for_sql = "SELECT transfer_for AS transfer_for FROM tbl_expense_transfer_for_master WHERE id = '".$key['transfer_for']." ' ";
//       $transfer_for_query = $db->fetchRow($transfer_for_sql);
//       $transfer_to_sql = "SELECT name AS name FROM tbl_user WHERE id = '".$key['transfered_to']."' ";
//       $tranfer_to_query = $db->fetchRow($transfer_to_sql);
//       $sub_array = array('po_no'=>$key['po_no'],'site_id'=>$key['site_id'],'transfer_for'=>$transfer_for_query['transfer_for'],'amount'=>$key['amount'],'transfer_date'=>date('d/m/Y', strtotime( $key['transfer_date']) ),'transfered_to'=>$tranfer_to_query['name'],'remark'=>$key['remark'], 'attachment'=>$key['attachment'] );
//       array_push($main_array_office, $sub_array);
//     }
//     $this->view->result_main_array_office = $main_array_office;
//   } else if ($params['type'] == '9') {
//     $yearlySiteExpenses_sql = "SELECT * FROM tbl_expense WHERE MONTH(transfer_date) = MONTH(CURDATE()) ORDER BY transfer_date DESC";
//     $yearlySiteExpenses_query = $db->fetchAll($yearlySiteExpenses_sql);
//     $main_array_site = array();
//     foreach ($yearlySiteExpenses_query as $key) {
//       $transfer_for_sql = "SELECT transfer_for AS transfer_for FROM tbl_expense_transfer_for_master WHERE id = '".$key['transfer_for']." ' ";
//       $transfer_for_query = $db->fetchRow($transfer_for_sql);
//       $transfer_to_sql = "SELECT name AS name FROM tbl_user WHERE id = '".$key['transfered_to']."' ";
//       $tranfer_to_query = $db->fetchRow($transfer_to_sql);
//       $sub_array = array('po_no'=>$key['po_no'],'site_id'=>$key['site_id'],'transfer_for'=>$transfer_for_query['transfer_for'],'amount'=>$key['amount'],'transfer_date'=>date('d/m/Y', strtotime( $key['transfer_date']) ),'transfered_to'=>$tranfer_to_query['name'],'remark'=>$key['remark'], 'attachment'=>$key['attachment'] );
//       array_push($main_array_site, $sub_array);
//     }
//     $this->view->result_main_array_site = $main_array_site;
//     $yearlyOfficeExpenses_sql = "SELECT * FROM tbl_office_expense WHERE MONTH(transfer_date) = MONTH(CURDATE()) ORDER BY transfer_date DESC";
//     $yearlyOfficeExpenses_query = $db->fetchAll($yearlyOfficeExpenses_sql);
//     $main_array_office = array();
//     foreach ($yearlyOfficeExpenses_query as $key) {
//       $transfer_for_sql = "SELECT transfer_for AS transfer_for FROM tbl_expense_transfer_for_master WHERE id = '".$key['transfer_for']." ' ";
//       $transfer_for_query = $db->fetchRow($transfer_for_sql);
//       $transfer_to_sql = "SELECT name AS name FROM tbl_user WHERE id = '".$key['transfered_to']."' ";
//       $tranfer_to_query = $db->fetchRow($transfer_to_sql);
//       $sub_array = array('po_no'=>$key['po_no'],'site_id'=>$key['site_id'],'transfer_for'=>$transfer_for_query['transfer_for'],'amount'=>$key['amount'],'transfer_date'=>date('d/m/Y', strtotime( $key['transfer_date']) ),'transfered_to'=>$tranfer_to_query['name'],'remark'=>$key['remark'], 'attachment'=>$key['attachment'] );
//       array_push($main_array_office, $sub_array);
//     }
//     $this->view->result_main_array_office = $main_array_office;
//   }
// }

 public function totalExpensesAction($value='')
 {

 }

 public function addInvoiceDetailsAction()
 {
  // $this->checklogin(); 
  // $auth                  = Zend_Auth::getInstance();
  // $authStorage           = $auth->getStorage();
  // $this->WebLoginID      = $authStorage->read()->WebLoginID;
  // $this->id              = $authStorage->read()->id;
  // $this->Role            = $authStorage->read()->Role; 
  // $this->role_type       = $authStorage->read()->role_type;
 	$params                = $this->view->params = $this->getRequest()->getParams(); 
 //  $this->view->totalnum  = $params['page'];
 //  $this->_helper->layout()->disableLayout(); 
 //  $this->view->messages  = $this->_flashMessenger->getMessages(); 
 //  $user = new Application_Model_User();
 //  $sum=0;
 //  if($this->role_type!='1'){
 //   $this->_redirect('/authlogout/logout');
 // }
 	echo '<pre>';
 	print_r($params);
//  if($params['order']){
//   if($params['type']){
//    $order .="order by ".$params['type']." ".$params['order']." ";
//  }else{
//   $order .="order by date(order_date) desc";
// }
// }else{
//   $order .="order by date(order_date) desc";
// }
// if($params['ponumber']){ $cond .="and po_no LIKE '".$params['ponumber']."%' "; } 
// if($params['siteid']){   $cond .="and description LIKE '%".$params['siteid']."%' "; } 
// $qry_all_po = "SELECT po_no FROM tbl_expense_report where 1 $cond $order";
// $res_all_po = $this->dbAdapter->fetchAll($qry_all_po);
// $keycount = 0; $all_po = array();
// foreach ($res_all_po as $key_all => $val_all) {
//   $all_po[$keycount] = $val_all['po_no']; 
//   $keycount++;
// } 
// $all_po = array_unique($all_po);
// $super_array = array();
// foreach ($all_po as $all_key => $all_val) {
//  $sql_abc = "select * from tbl_expense_report where po_no = '".$all_val."' order by id desc limit 1";
//  $res_abc  = $this->dbAdapter->fetchRow($sql_abc);
//  $sub_super_array = array('po_no'=>$all_val , 'operating_unit'=>$res_abc['operating_unit'] , 
//   'document_type'=>$res_abc['document_type'] , 'description'=>$res_abc['description'], 
//   'order_date'=>$res_abc['order_date'] , 'buyer'=>$res_abc['buyer'],
//   'currency'=>$res_abc['currency'], 'amount'=>$res_abc['amount'], 
//   'inclusive_tax'=>$res_abc['inclusive_tax'], 'exclusive_tax'=>$res_abc['exclusive_tax'],
//   'tax_amount'=>$res_abc['tax_amount'] , 'status'=>$res_abc['status'],
//   'acknowledgement'=>$res_abc['acknowledgement'] ,
//   'change_request_status'=>$res_abc['change_request_status']);
//  array_push($super_array,$sub_super_array);
// } 
//           $query_po = "select * from tbl_expense_report where rev!='1' $cond $order";
//           $po_list  = $this->dbAdapter->fetchAll($query_po);
//           $main_array = array(); 
//           foreach($super_array as $val){
//             $arr = explode('-',$val['description']); $arr1=array(); $k=0;
//             foreach ($arr as $key => $value) {
//              if($key!='0'){
//               $arr1[$k]=$value;
//               $k++;
//             }
//           }
//           $size=sizeof($arr1);
//           $sub_array = array('po_number'=>$val['po_no'],'order_date'=>$val['order_date'],'description'=>$val['description'],
//             'site_ids'=>$arr1,'amount'=>$val['amount'],'inclusive_tax'=>$val['inclusive_tax'],'exclusive_tax'=>$val['exclusive_tax'],'tax_amount'=>$val['exclusive_tax'],'size_of_array'=>$size,'change_request_status'=>$val['change_request_status'],'status'=>$val['status'],'acknowledgement'=>$val['acknowledgement']);
//           array_push($main_array,$sub_array);
//           $sum = $sum+$user->getExpensesByPo($val['po_no']);
//         }
//         $this->view->sum = $sum;
//         $page=$this->_getParam('page',1);
//         $paginator = Zend_Paginator::factory($main_array);      
//         $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); 
//         $paginator->setItemCountPerPage(10); 
//         $this->view->paginator = $paginator;
//         $this->view->totalrec = $paginator->getTotalItemCount();
//         if($params['type'] == 'id' && $params['order'] == 'desc' ) { 
//          $this->view->id_order = 'asc';  
//        }
//        else if($params['type'] == 'id' && $params['order'] == 'asc' ) { 
//          $this->view->id_order = 'desc';  }
//   $response = array();
//   $this->checklogin();
//   $db = Zend_Db_Table::getDefaultAdapter();
//   $params = $this->getRequest()->getParams();

//   $dataArray = array();
//   $dataArray['po_no'] = $this->test_input($params['po_no']); 
//   $dataArray['site_id'] = $this->test_input($params['site_id']); 
//   $dataArray['invoice_no'] = $this->test_input($params['invoice_no']); 
//   $dataArray['invoice_value'] = $this->test_input($params['invoice_val']); 
//   $dataArray['margin'] = $params['invoice_val'] - $params['expense']; 
//   $dataArray['created_at'] = date('Y-m-d H:i:s'); 
//   if(isset($_FILES['invoice_document']['error'] )){
//     if( $_FILES['invoice_document']['error'] == '0' ){
//      move_uploaded_file($_FILES['invoice_document']['tmp_name'],"uploads/expense/".$_FILES['invoice_document']['name']);
//      $dataArray['invoice_doc'] = "/uploads/expense/".$_FILES['invoice_document']['name'];
//    }else {
//     $dataArray['invoice_doc'] = "";  
//   }
// }
// if(isset($_FILES['bill_document']['error'] ) ){
//   if( $_FILES['bill_document']['error'] == '0' ){
//    move_uploaded_file($_FILES['bill_document']['tmp_name'],"uploads/expense/".$_FILES['bill_document']['name']);
//    $dataArray['bill_doc'] = "/uploads/expense/".$_FILES['bill_document']['name'];
//  }else {
//   $dataArray['bill_doc'] = "";  
// }
// }

// try {
//   $db->insert('tbl_invoice_details', $dataArray);
//   $response['flag'] = true;
//   $response['message'] = 'Invoice Details has been Added successfully.'; 
// } catch(Exception $e){
//   $error= $e->getMessage();
//   $response['flag'] = false;
//   $response['message'] =  $error;
// }
// echo json_encode($response);
// exit();
 }
 public function updateInvoiceDetailsAction()
 {
 	$response = array();
 	$this->checklogin();
 	$db = Zend_Db_Table::getDefaultAdapter();
 	$params = $this->getRequest()->getParams();
 	$invoice_sql = "SELECT * FROM tbl_invoice_details WHERE po_no=".$params['po_no']." AND site_id= '".$params['site_id']."'";
 	$invoice_result = $db->fetchRow($invoice_sql);

 	if ($invoice_result) {
 		$dataArray = array();
 		$dataArray['invoice_no'] = $this->test_input($params['invoice_no']); 
 		$dataArray['invoice_value'] = $this->test_input($params['invoice_val']); 
 		$dataArray['margin'] = $params['invoice_val'] - $params['expense']; 
 		$dataArray['updated_at'] = date('Y-m-d H:i:s'); 

 		if( isset( $_FILES['invoice_document']['error'] ) ){
 			if( $_FILES['invoice_document']['error'] == '0' ){
 				move_uploaded_file($_FILES['invoice_document']['tmp_name'],"uploads/expense/".$_FILES['invoice_document']['name']);
 				$dataArray['invoice_document'] = "/uploads/expense/".$_FILES['invoice_document']['name'];
 			}else {
 				$dataArray['invoice_document'] = "";  
 			}
 		}
 		if( isset( $_FILES['bill_document']['error'] ) ){
 			if( $_FILES['bill_document']['error'] == '0' ){
 				move_uploaded_file($_FILES['bill_document']['tmp_name'],"uploads/expense/".$_FILES['bill_document']['name']);
 				$dataArray['bill_document'] = "/uploads/expense/".$_FILES['bill_document']['name'];
 			}else {
 				$dataArray['bill_document'] = "";  
 			}
 		}
 		try {
 			$db->update('tbl_invoice_details', $dataArray, array('id=?'=>$invoice_result['id']));
 			$response['flag'] = true;
 			$response['message'] = 'Invoice Details has been Updated successfully.'; 

 		} catch(Exception $e){
 			$error= $e->getMessage();
 			$response['flag'] = false;
 			$response['message'] =  $error;
 		}
 	} else {
 		$error= $e->getMessage();
 		$response['flag'] = false;
 		$response['message'] =  "Something went wrong";
 	}
 	echo json_encode($response);
 	exit();
 }

 function test_input($data) {
 	$data = trim($data);
 	$data = stripslashes($data);
 	$data = htmlspecialchars($data);
 	return $data;
 }

 public function checklogin(){   
 	$auth           = Zend_Auth::getInstance(); 
 	$errorMessage   = ""; 
 	if(!$auth->hasIdentity()){
 		$this->_redirect('/admin/index');  
 	}   
 } 
 public function printExpenseAction()
 {
 	$this->view->params = $params = $this->getRequest()->getParams();

 	$officeExpensesDetailsQuery = $this->dbAdapter->select()
 	->from("tbl_office_expense as toe", array("*"))
 	->joinLeft("tbl_user as tu","tu.id = toe.transfered_to", array("payee"=>"tu.name"))
 	->joinLeft("tbl_companies as c","c.id = toe.company_id", array("*"))
 	->joinLeft("tbl_debit_account as tdc","tdc.id = toe.debit_account_id", array("debit_account"))
 	->joinLeft("tbl_payment_modes","tbl_payment_modes.id = toe.payment_mode_id", array("payment_mode"))
 	->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = toe.bank_account_id", array("bank_name","bank_account_number"))
 	->where('toe.is_deleted = 0')
 	->order("toe.transfer_date desc");

 	if(isset($params['from_date']) && $params['from_date'] != "" && isset($params['to_date']) && $params['to_date'] != ""){
 		$this->view->from_date = $params['from_date'];
 		$this->view->to_date = $params['to_date'];
 		$officeExpensesDetailsQuery->where("date(toe.transfer_date) BETWEEN '".$this->dateConverter($params['from_date'])."'  AND '".$this->dateConverter($params['to_date'])."'");
 	}
 	if(isset($params['company_id']) && $params['company_id'] != ""){
 		$this->view->company_id = $params['company_id'];
 		$officeExpensesDetailsQuery->where("toe.company_id=?",$params['company_id']);
 	}
 	$officeExpensesDetailsQuery->where("toe.id=?",$params['id']);

 	$this->view->officeExpenseDetails = $officeExpensesDetailsResult = $this->dbAdapter->fetchRow($officeExpensesDetailsQuery);
 	// echo '<pre>';print_r($officeExpensesDetailsResult);exit;
 	$layout = $this->_helper->layout();
 	$layout->disableLayout('');
 }
 public function approveExpenseAction()
 {
 	try {
 		$response = array();
 		$this->checklogin();
 		$requestParams = $this->getRequest()->getParams();
 		$db = $this->db = Zend_Db_Table::getDefaultAdapter();
 		$data_query = "Select id from tbl_user where id = ".$requestParams['createdby'];
 		$data = $this->dbAdapter->fetchRow($data_query);
 		if($requestParams['expense_id']!=''){
 			if($requestParams['approve']<1 && ($this->role == 3|| $this->role ==25)){
 				$Data['approved']    =($requestParams['approve']+2);
 				$where = array();
 				$where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['expense_id']);
 				$this->dbAdapter->update('tbl_office_expense', $Data, $where);
 				$response['flag'] = true;
 				$response['message'] = "Expense has been approved successfully.";
 			}else{
 				$response['flag'] = false;
 				$response['message'] = "Expense is already approved";
 			}
 			
 		} else {
 			$response['flag'] = false;
 			$response['message'] = "Expense ID is missing. Please try again.";
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

 public function getAttachDocumentsDetailsAction()
 {
 	try {
 		$this->checklogin();
 		$params = $this->getRequest()->getParams();

 		if ($this->getRequest()->isPost()) {
 			$DocumentsDetailsQuery = $this->dbAdapter->select()
 			->from("tbl_site_document", array("*"))
 			->where("status = ?", "1");
 			$this->view->DocumentsDetails = $DocumentsDetails = $this->dbAdapter->fetchAll($DocumentsDetailsQuery);

 			$SiteexpenseDocumentsQuery = $this->dbAdapter->select()
 			->from("tbl_site_expense_details as tsed", array("tsed.required_doc_type","tsed.attachment_path"))
 			->joinLeft("tbl_site_document as tsd","tsd.id = tsed.required_doc_type", array("tsd.document_name"))
 			->joinLeft("tbl_site_expense as tse","tse.id = tsed.site_expense_id",array("tse.po_no"))
 			->where("tse.po_no = ?", $params['po_no']);

 			$this->view->siteexpenseDocuments = $SiteexpenseDocuments = $this->dbAdapter->fetchAll($SiteexpenseDocumentsQuery);
 			// echo '<pre>';print_r($SiteexpenseDocuments);exit;

 		}
 		$this->_helper->layout()->disableLayout();
 	} catch(Exception $e){
 		echo $e->getMessage();
 		exit;
 	}
 }

 public function fundTransferAction(){
 	try {
 		$this->checklogin(); 
 		$this->view->messages      = $messages   = $this->_flashMessenger->getMessages();  
 		$this->view->params        = $params     = $this->getRequest()->getParams();
 		$master_model = new Application_Model_Master();
 		$companiesQuery = $this->dbAdapter->select()
 		->from("tbl_companies", array("*"))
 		->where("is_active = 1");
 		$this->view->companies = $expenseTypeListResult = $this->dbAdapter->fetchAll($companiesQuery);
 		$this->view->stateList =$statelist= $this->master_model->getStateNameMasterList();

 		if($this->getRequest()->isPost()){
 			// echo "<pre>";print_r($params);exit;
 			if($params['siteExpenseDateOfTransfer'] == ''){
 				$params['error'] = "Transfer Date missing. Please select transfer date.";
 				$this->view->params = $params;
 			}  else if($params['siteExpenseTransferAmount'] == ''){
 				$params['error'] = "Transfer amount missing. Please enter transfer amount.";
 				$this->view->params = $params;
 			} else if($params['amountTransferTo'] == ''){
 				$params['error'] = "Transfer to missing. Please select transfer to.";
 				$this->view->params = $params;
 			}else if($params['payment_mode_id'] == ''){
 				$params['error'] = "Payment Mode missing. Please select Payment Mode.";
 				$this->view->params = $params;
 			}else if($params['bank_account_id'] == ''){
 				$params['error'] = "Bank Account missing. Please select bank account.";
 				$this->view->params = $params;
 			} else {   
 				$insertData = array();
 				$stateForQuery = "SELECT operating_unit as operating_unit FROM tbl_po_details WHERE po_no = '".$params['poNumber']."' and is_deleted = 0";
 				$stateForResult = $this->dbAdapter->fetchRow($stateForQuery);
 				$company_query ="Select * from tbl_companies where id = ".$params['company_id'];
 				$companydata = $this->dbAdapter->fetchRow($company_query);
 				$insertData['company_id']          = $params['company_id'];
 				$insertData['transfer_type_id']          = $params['transferType'];
 				if($params['poNumber']){
 					$insertData['po_no']          = $params['poNumber'];
 				}
 				if($params['siteId']){
 					$insertData['site_id']        = $params['siteId'];
 				}
 				$insertData['amount']         = $params['siteExpenseTransferAmount'];
 				$insertData['transfer_date']  = $this->dateConverter($params['siteExpenseDateOfTransfer']);
 				$transfer_to = explode('-', $params['amountTransferTo']);
 				// echo '<pre>';print_r($transfer_to);exit;
 				$insertData['transfer_name']  = $transfer_to[0];
 				$insertData['allocation_type']  = $transfer_to[1];
 				$insertData['transfer_to']  = $transfer_to[2];
 				if ($params['siteExpenseTransferRemark']) {
 					$insertData['remark']         = $params['siteExpenseTransferRemark'];
 					$insertData['state_for']      = $stateForResult['operating_unit'];
 				}
 				$recommended_by = explode('-', $params['recommended_by']);
 				$insertData['recommended_by']= $recommended_by[2];
 				$insertData['recommended_name']= $recommended_by[0];
 				$insertData['approved_by']=  $params['approved_by'];
 				$insertData['payment_mode_id']          = $params['payment_mode_id'];
 				$insertData['bank_account_id']          = $params['bank_account_id'];
 				$insertData['created_at']     = date('Y-m-d H:i:s');
 				$insertData['created_by']     = $this->id;
 				// echo '<pre>';print_r($insertData);exit;
 				$this->dbAdapter->insert('tbl_fund_transfers', $insertData);
 				$lastInsertId = $this->dbAdapter->lastInsertId();
 				
 				$balanceData =$data= array();
 				$data = $this->dbAdapter->fetchRow("select balance from tbl_user_balance where user_id = ".$transfer_to[2]." ORDER BY created DESC");
 				// echo "<pre>";print_r($data);exit;
 				$balanceData['user_id'] = $transfer_to[2];
 				$balanceData['user_type'] = $transfer_to[1];
 				$balanceData['user_name'] =$transfer_to[0];
 				$balanceData['debit'] = 0;
 				$balanceData['credit'] = $params['siteExpenseTransferAmount'];
 				$balanceData['balance'] = $data['balance']+$params['siteExpenseTransferAmount'];
 				$this->dbAdapter->insert("tbl_user_balance", $balanceData);
 				$this->_flashMessenger->addMessage(array('success' => 'Site Expense has been saved successfully.'));
 				$this->_redirect('/expense/fund-transfer-report'); 
 			} /* end of check else */
 			
 			/* for office expense */
 		}
 	} catch(Exception $e){
 		echo $e->getMessage();
 		exit;
 	}
 }

 public function siteFundFormAction()
 {
 	try { 
 		$this->checklogin();
 		$params = $this->getRequest()->getParams();

 		$companiesQuery = $this->dbAdapter->select()
 		->from("tbl_companies", array("*"))
 		->where("is_active = 1");
 		$this->view->companies = $expenseTypeListResult = $this->dbAdapter->fetchAll($companiesQuery);

 		$bankAccountQuery = $this->dbAdapter->select()
 		->from("tbl_bank_accounts", array("*"))
 		->where("is_active = 1");
 		$this->view->bank_accounts = $bank_accounts = $this->dbAdapter->fetchAll($bankAccountQuery);

 		$debitAccountQuery = $this->dbAdapter->select()
 		->from("tbl_debit_account", array("*"))
 		->where("is_active = 1");
 		$this->view->debitAccount = $debitAccount = $this->dbAdapter->fetchAll($debitAccountQuery);

 		$paymentModesQuery = $this->dbAdapter->select()
 		->from("tbl_payment_modes", array("id","payment_mode"))
 		->where("is_active = 1");
 		$this->view->payment_modes = $payment_modes = $this->dbAdapter->fetchAll($paymentModesQuery);


 		$poNumberListQuery = $this->dbAdapter->select()
 		->from("tbl_po_details", array("id","po_no"))
 		->where('is_deleted=?',0)
 		->order("po_no asc");
 		$this->view->poNumbers = $poNumberListResult = $this->dbAdapter->fetchAll($poNumberListQuery);
 		
 		$site_documents_query = "SELECT * FROM `tbl_site_document` WHERE status =1";
 		$this->view->site_document =$site_documents=$this->dbAdapter->fetchAll($site_documents_query);
 		// echo '<pre>';print_r($site_documents);exit;
 		$expenseInMasterListQuery = $this->dbAdapter->select()
 		->from("tbl_expense_in_type_master", array("id","expense_in_type"))
 		->where("status = 1")
 		->where("expense_type_id = ?", $params['transfer_type']);
 		$this->view->expenseInMasterList = $expenseInMasterListResult = $this->dbAdapter->fetchAll($expenseInMasterListQuery);
 		$getUserListQuery = $this->dbAdapter->select()
 		->from('tbl_user', array('id','name'))
 		->where('status = 1');
 		$this->view->userList = $getUserListResult = $this->dbAdapter->fetchAll($getUserListQuery);
 		$getPayeeListQuery = $this->dbAdapter->select()
 		->from('tbl_payees', array('id','payee_name'))
 		->where('is_active = 1');
 		$this->view->Payees = $Payees = $this->dbAdapter->fetchAll($getPayeeListQuery);
 		$getTransporterListQuery = $this->dbAdapter->select()
 		->from('tbl_transporter_master', array('id','transporter_name'))
 		->where('is_active = 1');
 		$this->view->transporterList = $getTransporterListResult = $this->dbAdapter->fetchAll($getTransporterListQuery);
 		$getMaterialSupplierListQuery = $this->dbAdapter->select()
 		->from('tbl_material_supplier', array('id','supplier_name'))
 		->where('status = 1');
 		$this->view->materialSupplierList = $getMaterialSupplierListResult = $this->dbAdapter->fetchAll($getMaterialSupplierListQuery);
 		$getVendorListQuery = $this->dbAdapter->select()
 		->from('tbl_vendor', array('id','vendor_name','contact_person'))
 		->where('status = 1');
 		$this->view->vendorList = $getvendorListResult = $this->dbAdapter->fetchAll($getVendorListQuery);
 	} catch(Exception $e){
 		echo $e->getMessage();
 		exit;
 	}
 	$this->_helper->layout()->disableLayout();
 }

 public function officeFundFormAction(){
 	try { 
 		$this->checklogin();
 		$params = $this->getRequest()->getParams();

 		$companiesQuery = $this->dbAdapter->select()
 		->from("tbl_companies", array("*"))
 		->where("is_active = 1");
 		$this->view->companies = $expenseTypeListResult = $this->dbAdapter->fetchAll($companiesQuery);

 		$bankAccountQuery = $this->dbAdapter->select()
 		->from("tbl_bank_accounts", array("*"))
 		->where("is_active = 1");
 		$this->view->bank_accounts = $bank_accounts = $this->dbAdapter->fetchAll($bankAccountQuery);

 		$debitAccountQuery = $this->dbAdapter->select()
 		->from("tbl_debit_account", array("*"))
 		->where("is_active = 1");
 		$this->view->debitAccount = $debitAccount = $this->dbAdapter->fetchAll($debitAccountQuery);

 		$paymentModesQuery = $this->dbAdapter->select()
 		->from("tbl_payment_modes", array("id","payment_mode"))
 		->where("is_active = 1");
 		$this->view->payment_modes = $payment_modes = $this->dbAdapter->fetchAll($paymentModesQuery);

 		$site_documents_query = "SELECT * FROM `tbl_site_document` WHERE status =1";
 		$this->view->site_document =$site_documents=$this->dbAdapter->fetchAll($site_documents_query);
 		// echo '<pre>';print_r($site_documents);exit;
 		$expenseInMasterListQuery = $this->dbAdapter->select()
 		->from("tbl_expense_in_type_master", array("id","expense_in_type"))
 		->where("status = 1")
 		->where("expense_type_id = ?", $params['transfer_type']);
 		$this->view->expenseInMasterList = $expenseInMasterListResult = $this->dbAdapter->fetchAll($expenseInMasterListQuery);
 		$getUserListQuery = $this->dbAdapter->select()
 		->from('tbl_user', array('id','name'))
 		->where('status = 1');
 		$this->view->userList = $getUserListResult = $this->dbAdapter->fetchAll($getUserListQuery);
 		$getPayeeListQuery = $this->dbAdapter->select()
 		->from('tbl_payees', array('id','payee_name'))
 		->where('is_active = 1');
 		$this->view->Payees = $Payees = $this->dbAdapter->fetchAll($getPayeeListQuery);
 		$getTransporterListQuery = $this->dbAdapter->select()
 		->from('tbl_transporter_master', array('id','transporter_name'))
 		->where('is_active = 1');
 		$this->view->transporterList = $getTransporterListResult = $this->dbAdapter->fetchAll($getTransporterListQuery);
 		$getMaterialSupplierListQuery = $this->dbAdapter->select()
 		->from('tbl_material_supplier', array('id','supplier_name'))
 		->where('status = 1');
 		$this->view->materialSupplierList = $getMaterialSupplierListResult = $this->dbAdapter->fetchAll($getMaterialSupplierListQuery);
 		$getVendorListQuery = $this->dbAdapter->select()
 		->from('tbl_vendor', array('id','vendor_name','contact_person'))
 		->where('status = 1');
 		$this->view->vendorList = $getvendorListResult = $this->dbAdapter->fetchAll($getVendorListQuery);
 	} catch(Exception $e){
 		echo $e->getMessage();
 		exit;
 	}
 	$this->_helper->layout()->disableLayout();
 }

 public function fundTransferReportAction(){
 	try {
 		$this->checklogin(); 
 		$this->view->params = $params = $this->getRequest()->getParams();
 		$this->view->messages   = $this->_flashMessenger->getMessages();
 		$siteDetails = array();
 		$totalExpenseAmountQuery = $this->dbAdapter->select()
 		->from("tbl_fund_transfers", array('sum(amount) as total_amount'))
 		->order("transfer_date desc");

 		if(isset($params['from_date']) && $params['from_date'] != "" && isset($params['to_date']) && $params['to_date'] != ""){
 			$totalExpenseAmountQuery->where("date(transfer_date) BETWEEN '".$this->dateConverter($params['from_date'])."'  AND '".$this->dateConverter($params['to_date'])."'");
 		}
 		$this->view->total_amount = $total_amount = $this->dbAdapter->fetchRow($totalExpenseAmountQuery);
 		// echo '<pre>';print_r($total_amount);exit;

 		$fundTransferDetailsQuery = $this->dbAdapter->select()
 		->from("tbl_fund_transfers as toe", array("*"))
 		->joinLeft("tbl_user as tu","tu.id = toe.transfer_to", array("tu.name"))
 		->joinLeft("tbl_companies as c","c.id = toe.company_id", array("c.name as company"))
 		->joinLeft("tbl_payment_modes","tbl_payment_modes.id = toe.payment_mode_id", array("payment_mode"))
 		->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = toe.bank_account_id", array("bank_name","bank_account_number"))
 		->order("toe.transfer_date desc");

 		if(isset($params['from_date']) && $params['from_date'] != "" && isset($params['to_date']) && $params['to_date'] != ""){
 			$this->view->from_date = $params['from_date'];
 			$this->view->to_date = $params['to_date'];
 			$fundTransferDetailsQuery->where("date(toe.transfer_date) BETWEEN '".$this->dateConverter($params['from_date'])."'  AND '".$this->dateConverter($params['to_date'])."'");
 		}
 		if(isset($params['company_id']) && $params['company_id'] != ""){
 			$this->view->company_id = $params['company_id'];
 			$fundTransferDetailsQuery->where("toe.company_id=?",$params['company_id']);
 		}
 		$this->view->fundDetailsResult = $fundDetailsResult = $this->dbAdapter->fetchAll($fundTransferDetailsQuery);
 		$this->view->siteDetails = $this->array_sort($siteDetails,'last_fund_transfer_date');
 		if($this->getRequest()->isPost()){
 			if(isset($params['amount']) || isset($params['transfer_date'])){
 				$updateArray = array();
 				$updateArray['amount'] = isset($params['amount'])?$params['amount']:0;
 				if(isset($params['transfer_date'])){
 					$updateArray['transfer_date'] = $this->dateConverter($params['transfer_date']);;
 				}
 				$this->dbAdapter->update('tbl_fund_transfers' ,$updateArray, array('id = ?'=>$params['id']));
 				$this->_flashMessenger->addMessage(array("success"=>"Fund details have been updated successfully"));
 				$this->_redirect("/expense/fund-transfer-reports");
 			}
 		}
 	} catch(Exception $e){
 		echo $e->getMessage();
 		exit;
 	}
 }

 public function fundTransferReportsAction(){
    
 	try {
 		$this->checklogin(); 
 		$this->view->params = $params = $this->getRequest()->getParams();
 		$this->view->messages   = $this->_flashMessenger->getMessages();
 		$siteDetails = array();
 		$totalExpenseAmountQuery = $this->dbAdapter->select()
 		->from("tbl_fund_transfers", array('sum(amount) as total_amount'))
 		->order("transfer_date desc");

 		if(isset($params['from_date']) && $params['from_date'] != "" && isset($params['to_date']) && $params['to_date'] != ""){
 			$totalExpenseAmountQuery->where("date(transfer_date) BETWEEN '".$this->dateConverter($params['from_date'])."'  AND '".$this->dateConverter($params['to_date'])."'");
 		}
 		$this->view->total_amount = $total_amount = $this->dbAdapter->fetchRow($totalExpenseAmountQuery);
//  print_r($this->dateConverter($params['transfer_date']));
//  exit;
 		$fundTransferDetailsQuery = $this->dbAdapter->select()
 		->from("tbl_fund_transfers as toe", array("*"))
 		->joinLeft("tbl_user as tu","tu.id = toe.transfer_to", array("tu.name"))
 		->joinLeft("tbl_companies as c","c.id = toe.company_id", array("c.name as company"))
 		->joinLeft("tbl_payment_modes","tbl_payment_modes.id = toe.payment_mode_id", array("payment_mode"))
 		->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = toe.bank_account_id", array("bank_name","bank_account_number"))
 		->order("toe.transfer_date desc");

 		if(isset($params['from_date']) && $params['from_date'] != "" && isset($params['to_date']) && $params['to_date'] != ""){
 			$this->view->from_date = $params['from_date'];
 			$this->view->to_date = $params['to_date'];
 			$fundTransferDetailsQuery->where("date(toe.transfer_date) BETWEEN '".$this->dateConverter($params['from_date'])."'  AND '".$this->dateConverter($params['to_date'])."'");
 		}
 		if(isset($params['company_id']) && $params['company_id'] != ""){
 			$this->view->company_id = $params['company_id'];
 			$fundTransferDetailsQuery->where("toe.company_id=?",$params['company_id']);
 		}
 		$this->view->fundDetailsResult = $fundDetailsResult = $this->dbAdapter->fetchAll($fundTransferDetailsQuery);
 		$this->view->siteDetails = $this->array_sort($siteDetails,'last_fund_transfer_date');
 		if($this->getRequest()->isPost()){
 			if(isset($params['amount']) || isset($params['transfer_date'])){
 				$updateArray = array();
 				$updateArray['amount'] = isset($params['amount'])?$params['amount']:0;
 				if(isset($params['transfer_date'])){
 					$updateArray['transfer_date'] = $this->dateConverter($params['transfer_date']);
 				}
 				$this->dbAdapter->update('tbl_fund_transfers' ,$updateArray, array('id = ?'=>$params['id']));
 				$this->_flashMessenger->addMessage(array("success"=>"Fund details have been updated successfully"));
 				$this->_redirect("/expense/fund-transfer-reports");
 			}
 		}
 	} catch(Exception $e){
 		echo $e->getMessage();
 		exit;
 	}
 }

 public function getFundAmountDetailsAction()
 {
 	try {
 		$this->checklogin();
 		$params = $this->getRequest()->getParams();
 		$expenseDetailsQuery = $this->dbAdapter->select()
 		->from("tbl_fund_transfers", array("*"))
 		->joinLeft("tbl_user","tbl_user.id = tbl_fund_transfers.transfer_to", array("name"))
 		->where("tbl_fund_transfers.id = ?", $params['transfer_id']);
 		$this->view->expenseDetails = $expenseDetailsResult = $this->dbAdapter->fetchRow($expenseDetailsQuery);
 		// echo '<pre>';print_r($expenseDetailsResult);exit;

 		$this->_helper->layout()->disableLayout();
 	} catch(Exception $e){
 		echo $e->getMessage();
 		exit;
 	}
 }

 public function getUserFundTransferDetailsAction(){
 	try{
 		$this->checklogin();
 		$params = $this->getRequest()->getParams();
 		$UserQuery = $this->dbAdapter->select()
 		->from("tbl_user_balance as tbu", array("tbu.*"))
 		->where("tbu.user_id = ?", $params['transfer_to'])
 		->where("tbu.user_type = ?",$params['transfer_to_type']);
 		$this->view->UserFunds = $UserFunds = $this->dbAdapter->fetchAll($UserQuery);
 		$this->_helper->layout()->disableLayout();

 		// echo "<pre>";print_r($UserFunds);exit;
 	}catch(Exception $e){
 		echo $e->getMessage();
 		exit;
 	}
 }


 public function addNewPoAction(){
 	try{
 		$this->checklogin();
 		$params = $this->getRequest()->getParams();
 		$response = array();
 		if ($this->getRequest()->isPost()) {	
 			// echo '<pre>';print_r($params);exit;
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
 			}else {
 				$this->dbAdapter->beginTransaction();
 				$insertData = array();
 				$insertData['state_id'] 		= trim($params['state_id']);
 				$insertData['client_id'] 		= trim($params['client_id']);
 				$insertData['po_no'] 			= trim($params['po_number']);
 				$insertData['po_amount'] 		= trim($params['po_amount']);
 				$insertData['document_type'] 	= trim($params['po_type']);
 				$insertData['order_date'] 		= $this->dateConverter(trim($params['po_date']));
 				$insertData['rev'] 				= trim($params['revision']);
 				$insertData['operating_unit'] 	= '';
 				$insertData['status'] 			= "Open";
 				$this->dbAdapter->insert('tbl_po_details', $insertData);
 				// echo '<pre>';print_r($insertData);
 				$insertSiteDetails = array();
 				$insertSiteDetails['client_id'] 	= trim($params['client_id']);
 				$insertSiteDetails['po_no'] 		= $params['po_number'];
 				$insertSiteDetails['site_id'] 		= $params['site_id'];
 				$insertSiteDetails['site_name'] 	= $params['site_name'];
 				$insertSiteDetails['status'] 		= "0";
 				$insertSiteDetails['order_date'] 	= $this->dateConverter(trim($params['po_date']));
 				$insertSiteDetails['created_at'] 	= date('Y-m-d H:i:s');
 				$this->dbAdapter->insert('tbl_po_sites', $insertSiteDetails);
 				// echo '<pre>';print_r($insertSiteDetails);
 				$insertSiteDeploymentData = array();
 				$insertSiteDeploymentData['state_id'] 		= trim($params['state_id']);
 				$insertSiteDeploymentData['client_id'] 		= trim($params['client_id']);
 				$insertSiteDeploymentData['po'] 			= $params['po_number'];
 				$insertSiteDeploymentData['site_id'] 		= $params['site_id'];
 				$insertSiteDeploymentData['work_type'] 		= $params['work_type'];
 				$insertSiteDeploymentData['infratel_id'] 	= $params['infratel_id'];
 				if ($params['so_number']) {
 					$insertSiteDeploymentData['so_no'] 		= $params['so_number'];
 				}
 				if ($params['location']) {
 					$insertSiteDeploymentData['location'] 		= $params['location'];
 				}
 				$insertSiteDeploymentData['status'] 		= "0";
 				$insertSiteDeploymentData['po_date'] 		= $this->dateConverter(trim($params['po_date']));
 				$insertSiteDeploymentData['importation_datetime'] 	= date('Y-m-d H:i:s');
 				$this->dbAdapter->insert('tbl_deployment', $insertSiteDeploymentData);
 				// echo '<pre>';print_r($insertSiteDeploymentData);
 				$insertSiteLocationData = array();
 				$insertSiteLocationData['infratel_site_id'] 	= $params['infratel_id'];
 				if ($params['longitude']) {
 					$insertSiteLocationData['longitude'] 		= $params['longitude'];
 				}
 				if ($params['latitude']) {
 					$insertSiteLocationData['latitude'] 		= $params['latitude'];
 				}
 				$insertSiteLocationData['importation_datetime'] 	= date('Y-m-d H:i:s');
 				// echo '<pre>';print_r($insertSiteLocationData);
 				$this->dbAdapter->insert('tbl_location_mapping', $insertSiteLocationData);
 				$data =$sites='';
 				$poNumberListQuery = $this->dbAdapter->select()
 				->from("tbl_po_details", array("id","po_no"))
 				->where('is_deleted=?',0)
 				->order("po_no asc");
 				$poNumberListResult = $this->dbAdapter->fetchAll($poNumberListQuery);

 				$siteQuery = $this->dbAdapter->select()
 				->from("tbl_po_sites", array("id","site_id"))
 				->where('is_deleted=?',0)
 				->where('po_no = ? ',$params['po_number']);
 				$siteListResult = $this->dbAdapter->fetchAll($siteQuery);

 				foreach ($poNumberListResult as $key => $value) {
 					$data .= '<option value="'.$value['po_no'].'"';
 					if($value['po_no'] == $params['po_number']){
 						$data .= 'selected';
 					}
 					$data .= '>'.$value['po_no'].'</option>';
 				}
 				foreach ($siteListResult as  $site_data) {
 					$sites .= '<option value="'.$site_data['site_id'].'" selected >'.$site_data['site_id'].'</option>';
 				}
 				// echo '<pre>';print_r($data);exit;

 				$this->dbAdapter->commit();
 				$response['flag'] = true;
 				$response['title'] = "Added Successfully";
 				$response['options'] = $data;
 				$response['sites'] = $sites;
 				$response['message'] = "PO and Sites have been added successfully.";

 			}
 			$this->_helper->layout()->disableLayout();

 			echo json_encode($response);
 			exit;
 		}
 		$this->_helper->layout()->disableLayout();

 	}catch(Exception $e){
 		echo $e->getMessage();
 		$this->dbAdapter->rollBack();
 		exit;
 	}
 }


 public function addNewPayeeAction()
 {
 	try{
 		$this->checklogin();
 		$params = $this->getRequest()->getParams();
 		$response = array();

 		if ($this->getRequest()->isPost()) {
 			$insertData = array();
 			$insertData['payee_name'] 		= trim($params['name']);
 			$insertData['mobile_no'] 		= trim($params['mobile']);
 			$insertData['address'] 			= trim($params['address']);
 			$this->dbAdapter->insert('tbl_payees', $insertData);
 			$getPayeeListQuery = $this->dbAdapter->select()
 			->from('tbl_payees', array('id','payee_name'))
 			->where('is_active = 1')
 			->where('payee_name = ?' , $params['name']);
 			$Payees = $this->dbAdapter->fetchRow($getPayeeListQuery);
 			$options = "<option value='".$Payees['payee_name']."-payee-".$Payees['id']."' selected >".$Payees['payee_name']."</option>";
 			$response['flag'] = true;
 			$response['title'] = "Added Successfully";
 			$response['options'] = $options;
 			$response['message'] = "Payees have been added successfully.";
 			$this->_helper->layout()->disableLayout();

 			
 		}
 		
 		$this->_helper->layout()->disableLayout();
 		echo json_encode($response);
 		exit; 	
 	}catch(Exception $e){
 		echo $e->getMessage();
 		exit;
 	}
 	
 }
 
 public function invoiceReportAction(){
		try{
			$this->_redirect('/invoice/invoice-report');
		} catch(Exception $e){
			echo $e->getMessage();
			exit;
		}
	}
}
?>