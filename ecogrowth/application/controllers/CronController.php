<?php 


class CronController extends Zend_Controller_Action{

	var $phpNative;
	var $db;
	var $currdate;
	var $siteurl;
	var $dbAdapter;

	public function init(){
		//Initialize action controller here 
		$this->_helper->viewRenderer->setNoRender(true);
		$bootstrap 				= $this->getInvokeArg('bootstrap');
		$aConfig 				= $bootstrap->getOptions();
		$this->secretkey 		= $aConfig['api']['searchuser']['secret'];
		$this->siteurl 			= $aConfig['api']['site']['url'];
		$this->email 			= $aConfig['api']['email']['url'];
		$this->view->duration   = $aConfig['pending']['days']['duration'];
		$this->db 				= Zend_Db_Table::getDefaultAdapter();
		$this->day 				= date("d");
		$this->month 			= date("m");
		$this->year 			= date("Y");
		$this->currdate 		= date("Y-m-d H:i:s");
	}

	public function checkPendingPoAction(){
		
		$db = Zend_Db_Table::getDefaultAdapter();
		// $notificationQuery = "SELECT count(id) as total_unread FROM tbl_notifications WHERE is_read = 0";
		// $notifications = $db->fetchAll($notificationQuery);
		// $notificationsCount = $notifications['total_unread'];
		$query = "SELECT po_no, order_date FROM tbl_expense_report WHERE status = 'open'";
		$results = $db->fetchAll($query);

		$registrationIDs = array() ;
		$userQuery = "SELECT firebase_token FROM tbl_user WHERE role_type=2";
		$users = $db->fetchAll($userQuery);
		foreach ($users as $user) {
			array_push($registrationIDs, $user['firebase_token']);
		}

		$i = 0;
		foreach ($results as $po) {
			$currdate = date('Y-m-d');
			$date1=date_create(date('Y-m-d',strtotime($po['order_date'])));
			$date2=date_create($currdate);
			$diff=date_diff($date1,$date2);
			$days_difference = $diff->format("%a");
			if($days_difference > 10){
				$message = 'PO Number : '.$po['po_no'].' Pending from last '.$days_difference .' Days';
				$notificationArray = array();
				$notificationArray['notification'] = $message;
				$db->insert('tbl_notifications',$notificationArray);
				// $notificationsCount = $notificationsCount + 1;
				$this->NotifyAndroid($registrationIDs,$message);
				$i++;
			}
		}
		echo 'Sent notification for '.$i.' POs';
		exit;
	}

	public function NotifyAndroid($registrationIDs,$message)
	{
		define( 'API_ACCESS_KEY', 'AAAAR37bz7M:APA91bFapAr0IQGTqkJcxXz2d1TNeJcGl1hvK6DIuNINXmsz46KlAwBEEOE2jfYWVodJzZC820njcuhRhX877A0-a5Rf4QZaePozDKxSgXsKEA_ebqfjbkFiXTUq0fdSQ6hvD81U71PTQmzaUSnUYvwoFPyZgRHJPg' );
		$body = array(
			'registration_ids' => $registrationIDs,
			"data"=>array(
				'body'=>$message,
				// 'notificationsCount'=>$notificationsCount,
				'title'=>'Amit Sent you a message',
				"click_action"=> "MessengerActivity",
				'vibrate' => 1,
				'sound' => "default",
				'icon' => "appLogo",
				'images'=> 1,
			),
			"priority" => 10
		);
		$headers = array(
			'Authorization: key=' . API_ACCESS_KEY,
			'Content-Type: application/json'
		);
		$ch = curl_init();
		curl_setopt( $ch,CURLOPT_URL, 'https://fcm.googleapis.com/fcm/send' );
		curl_setopt( $ch,CURLOPT_POST, true );
		curl_setopt( $ch,CURLOPT_HTTPHEADER, $headers );
		curl_setopt( $ch,CURLOPT_RETURNTRANSFER, true );
		curl_setopt( $ch,CURLOPT_SSL_VERIFYPEER, false );
		curl_setopt( $ch,CURLOPT_POSTFIELDS, json_encode( $body ) );
		$result = curl_exec($ch );
		curl_close( $ch );
		return true;
	}

	public function dailyUpdateDashboardAction(){
		try{
			$db = Zend_Db_Table::getDefaultAdapter();
			$data = array();
			$date = date('Y-m-d');
			$officeExpensesDetailsQuery = $db->select()
			->from("tbl_office_expense as toe", array("*"))
			->joinLeft("tbl_user as tu","tu.id = toe.transfered_to", array("tu.name as payee"))
			->joinLeft("tbl_companies as c","c.id = toe.company_id", array("c.name as company"))
			->joinLeft("tbl_payment_modes","tbl_payment_modes.id = toe.payment_mode_id", array("payment_mode"))
			->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = toe.bank_account_id", array("bank_name","bank_account_number"))
			->where('toe.is_deleted = 0')
			->where("date(toe.created_at)=?",$date);
			$data['officeExpense']=$officeExpense = $db->fetchAll($officeExpensesDetailsQuery);

			$siteExpenseQuery =$db->select()
			->from("tbl_site_expense as toe", array("*"))
			->joinLeft("tbl_companies as c","c.id = toe.company_id", array("c.name as company"))
			->joinLeft("tbl_payment_modes","tbl_payment_modes.id = toe.payment_mode_id", array("payment_mode"))
			->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = toe.bank_account_id", array("bank_name","bank_account_number"))
			->where("date(toe.created_at) = ?",$date);
			$data['siteExpense']=$siteExpense = $db->fetchAll($siteExpenseQuery);
			$fundDataQuery =$db->select()
			->from("tbl_fund_transfers as toe", array("*"))
			->joinLeft("tbl_companies as c","c.id = toe.company_id", array("c.name as company"))
			->joinLeft("tbl_payment_modes","tbl_payment_modes.id = toe.payment_mode_id", array("payment_mode"))
			->joinLeft("tbl_bank_accounts","tbl_bank_accounts.id = toe.bank_account_id", array("bank_name","bank_account_number"))
			->where("date(toe.created_at) = ?",$date);
			$data['fundData'] =$fundData =$db->fetchAll($fundDataQuery);
			$invoiceReportQuery = "Select tid.*,tcm.client_name,ts.state_name ,tcvm.vendor_company_name from tbl_punched_invoice_details tid 
			left join tbl_client_master tcm on tcm.id = tid.client_id 
			left join tbl_states ts on ts.id = tid.state_for_id
			left join  tbl_company_vendor_master tcvm on tcvm.id = tid.company_vendor_id 
			WHERE tid.status = 1 and tid.invoice_date LIKE '%".$date."%'";
			$data['invoice'] =$invoiceReportResult =$db->fetchAll($invoiceReportQuery);
			// echo "<pre>"; print_r($invoiceReportQuery);
			$stock_in_query = " select tsid.*,ts.supplier_name ,tpt.product_type_name,tmb.brand_name,tp.product_name,tsi.stock_in_date
			from tbl_stock_in tsi 
			inner join tbl_stock_in_details tsid ON tsi.id = tsid.stock_in_id 
			inner join tbl_product_type tpt ON tpt.id = tsid.product_type 
			inner join tbl_material_brand tmb ON tmb.id = tsid.brand_name 
			inner join tbl_products tp ON tp.id = tsid.product_name
			inner join tbl_material_supplier ts ON ts.id = tsi.supplier_id
			Where tsi.stock_in_date LIKE '%".$date."%'";
			$data['invoice']= $stock_in_details =$db->fetchAll($stock_in_query);
			// echo "<pre>"; print_r($stock_in_details);
			$stock_out_query = " select tsi.*,tsid.*,tpt.product_type_name,tmb.brand_name,tp.product_name from tbl_stock_out tsi 
			inner join tbl_stock_out_details tsid ON tsi.id = tsid.stock_out_id 
			inner join tbl_product_type tpt ON tpt.id = tsid.product_type 
			inner join tbl_material_brand tmb ON tmb.id = tsid.brand
			inner join tbl_products tp ON tp.id = tsid.product_name
			Where stock_out_date  LIKE '%".$date."%'";
			$data['stock_out']= $stock_out_details =$db->fetchAll($stock_out_query);
			// echo "<pre>"; print_r($stock_out_details);
			$po_sites_query = "Select tps.*,tpd.*,tcm.client_name from tbl_po_details tpd 
			inner join tbl_po_sites tps ON tpd.po_no = tpd.po_no 
			inner join tbl_client_master tcm ON tcm.id = tpd.client_id
			Where  tpd.created_at  LIKE '%".$date."%'";
			$data['po_sites'] = $po_sites_data =$db->fetchAll($po_sites_query);

			$subject     = "Logimetrix - Infra Update";
			$from_email  = 'logimetrix@gmail.com';
			$to_email    = 'raisahaab@gmail.com';
			$msg ='<p><b>Dear Sir/Madam</b><br><br>';

			$msg .='<table border= "3">';
			$msg .='<tr>
			<td colspan= "8" align="center"><b>Fund Data<b></td>
			</tr>
			<tr>
			<td>Transfer Date</td>
			<td>Comapny</td>
			<td>Payment Mode</td>
			<td>Bank Name</td>
			<td>Transfered To</td>
			<td>Amount</td>
			<td>Remark</td>
			</tr>';
			foreach ($fundData as $key => $value) {
				if($value != ""){
					
					$msg .= '<tr>
					<td>'.date('d-m-Y',strtotime($value['transfer_date'])).'</td>
					<td>'.$value['company'].'</td>
					<td>'.$value['payment_mode'].'</td>
					<td>'.$value['bank_name'].'</td>
					<td>'.$value['transfer_name'].'</td>
					<td>'.$value['amount'].'</td>
					<td>'.$value['remark'].'</td>
					</tr>';
				}
			}
			$msg .= '</table>';
			$msg .='<table border= "3">';
			$msg .='<tr>
			<td colspan= "8" align="center"><b>Site Expense<b></td>
			</tr>
			<tr>
			<td>Transfer Date</td>
			<td>Comapny</td>
			<td>Payment Mode</td>
			<td>Bank Name</td>
			<td>Transfered To</td>
			<td>Amount</td>
			<td>Remark</td>
			</tr>';
			foreach ($siteExpense as $key => $value) {
				if($value != ""){
					
					$msg .= '<tr>
					<td>'.date('d-m-Y',strtotime($value['transfer_date'])).'</td>
					<td>'.$value['company'].'</td>
					<td>'.$value['payment_mode'].'</td>
					<td>'.$value['bank_name'].'</td>
					<td>'.$value['transfer_name'].'</td>
					<td>'.$value['amount'].'</td>
					<td>'.$value['remark'].'</td>
					</tr>';
				}
			}
			$msg .= '</table>';
			$msg .='<table border= "3">';
			$msg .='<tr>
			<td colspan= "8" align="center"><b>Office Expense<b></td>
			</tr>
			<tr>
			<td>Transfer Date</td>
			<td>Comapny</td>
			<td>Payment Mode</td>
			<td>Bank Name</td>
			<td>Transfered To</td>
			<td>Amount</td>
			<td>Remark</td>
			</tr>';
			foreach ($officeExpense as $key => $value) {
				if($value != ""){
					
					$msg .= '<tr>
					<td>'.date('d-m-Y',strtotime($value['transfer_date'])).'</td>
					<td>'.$value['company'].'</td>
					<td>'.$value['payment_mode'].'</td>
					<td>'.$value['bank_name'].'</td>
					<td>'.$value['payee'].'</td>
					<td>'.$value['amount'].'</td>
					<td>'.$value['remark'].'</td>
					</tr>';
				}
			}
			$msg .= '</table>';
			$msg .='<table border= "3">';
			$msg .='<tr>
			<td colspan= "8" align="center"><b>Invoices<b></td>
			</tr>
			<tr>
			<td>Invoice Date</td>
			<td>Po Number</td>
			<td>Site Id</td>
			<td>Client Name</td>
			<td>State Name</td>
			<td>Remark</td>
			</tr>';
			foreach ($invoiceReportResult as $key => $value) {
				if($value != ""){
					
					$msg .= '<tr>
					<td>'.date('d-m-Y',strtotime($value['invoice_date'])).'</td>
					<td>'.$value['po_no'].'</td>
					<td>'.$value['site_id'].'</td>
					<td>'.$value['client_name'].'</td>
					<td>'.$value['state_name'].'</td>
					<td>'.$value['invoice_remark'].'</td>
					</tr>';
				}
			}
			$msg .= '</table>';
			$msg .='<table border= "3">';
			$msg .='<tr>
			<td colspan= "8" align="center"><b>PO Sites<b></td>
			</tr>
			<tr>
			<td>Date</td>
			<td>Po Number</td>
			<td>Operating Unit</td>
			<td>Client Name</td>
			</tr>';
			foreach ($po_sites_data as $key => $value) {
				if($value != ""){
					
					$msg .= '<tr>
					<td>'.date('d-m-Y',strtotime($value['created_at'])).'</td>
					<td>'.$value['po_no'].'</td>
					<td>'.$value['operating_unit'].'</td>
					<td>'.$value['client_name'].'</td>
					</tr>';
				}
			}
			$msg .= '</table>';
			$msg .='<table border= "3">';
			$msg .='<tr>
			<td colspan= "8" align="center"><b>Stock in<b></td>
			</tr>
			<tr>
			<td>Stock In Date</td>
			<td>Product</td>
			<td>Brand</td>
			<td>Supplier Name</td>
			<td>Quantity</td>
			<td>Unit</td>
			<td>Product Type</td>
			</tr>';
			foreach ($stock_in_details as $key => $value) {
				if($value != ""){
					
					$msg .= '<tr>
					<td>'.date('d-m-Y',strtotime($value['stock_in_date'])).'</td>
					<td>'.$value['product_name'].'</td>
					<td>'.$value['brand_name'].'</td>
					<td>'.$value['supplier_name'].'</td>
					<td>'.$value['qunantity'].'</td>
					<td>'.$value['unit'].'</td>
					<td>'.$value['product_type_name'].'</td>
					</tr>';
				}
			}
			$msg .= '</table>';
			$msg .='<table border= "3">';
			$msg .='<tr>
			<td colspan= "8" align="center"><b>Stock Out<b></td>
			</tr>
			<tr>
			<td> Date</td>
			<td>Product</td>
			<td>Brand</td>
			<td>Allocated By</td>
			<td>Quantity</td>
			<td>Unit</td>
			<td>Product Type</td>
			</tr>';
			foreach ($stock_out_details as $key => $value) {
				if($value != ""){
					
					$msg .= '<tr>
					<td>'.date('d-m-Y',strtotime($value['stock_out_date'])).'</td>
					<td>'.$value['product_name'].'</td>
					<td>'.$value['brand_name'].'</td>
					<td>'.$value['allocated_by'].'</td>
					<td>'.$value['quantity'].'</td>
					<td>'.$value['unit'].'</td>
					<td>'.$value['product_type_name'].'</td>
					</tr>';
				}
			}
			$msg .= '</table>';

			$msg .='Have a great day!<br><br>

			<b>Regards,</b><br><br>

			<b>Logimetrix Techsolutions Pvt. Ltd.</b></p>';
			// echo '<pre>';print_r($msg);exit;
			require_once('Zend/Mail/Transport/Smtp.php');
			require_once 'Zend/Mail.php';
			$config = array('ssl' => 'tls',
				'auth' => 'login',
				'port'      => '587',
				'username' => 'developer.logimetrix@gmail.com',
				'password' => 'logimetrix@2016'
			);

			$transport = new Zend_Mail_Transport_Smtp('smtp.gmail.com', $config);
                    //print_r($transport);
                    //exit();
			try {
				$mail = new Zend_Mail();
				$mail->setBodyHtml($msg);
				$mail->setFrom('logimetrix@gmail.com');
				$mail->addTo($to_email, 'Shantanu Rai');
				$mail->addCc('yadavneha317@gmail.com');
				$mail->setSubject($subject);
				$mail->send($transport);
			} 
			catch (Exception $ex){
				$this->view->errorMessage = $ex->getMessage();
			}
			
			// echo '<pre>';
			// print_r($po_sites_data);
			// print_r($officeExpense);
			// print_r($siteExpense);
			// print_r($stock_in_details);
			// print_r($stock_out_details);
			// print_r($po_sites_data);
			// exit;
			// echo '<pre>';print_r($siteExpense);exit;
		}catch(Exception $e){
			echo $e->getMessage();exit;
		}
		
		exit;
	}


	public function sendEmail($task_id, $user_id, $due_date, $created_by){
                    ////SMTP EMail Code
		
	}
}