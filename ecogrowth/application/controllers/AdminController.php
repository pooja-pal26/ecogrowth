<?php

/**
* Logimetrix Techsolutions Pvt. Ltd.
* File Name   : AdminController.php
* File Description  : AdminController
* Created By : Ajay Kumar
* Created Date: 26 May 2017
 */
	 
class AdminController extends Zend_Controller_Action
{
  var $dbAdapter;
	
    public function init()
    {
        /* Initialize action controller here */
        $this->_flashMessenger 		= $this->_helper->getHelper('FlashMessenger');
        $this->initView();
		$bootstrap 					= $this->getInvokeArg('bootstrap');
		$aConfig 					= $bootstrap->getOptions();
		$this->siteurl 				= $aConfig['api']['site']['url'];
		$this->email 				= $aConfig['api']['email']['url'];
		$this->tokenExpireTime 		= $aConfig['token']['expire']['time'];
		$this->db 					= Zend_Db_Table::getDefaultAdapter();
		$this->currdate 			= date("Y-m-d H:i:s");//$date->toString('Y-m-d H:m:s');
		$auth 						= Zend_Auth::getInstance();
		$authStorage 				= $auth->getStorage();
		if(isset($authStorage->read()->WebLoginID)){
			$this->WebLoginID 		= $authStorage->read()->WebLoginID;
			$admin 					= new Application_Model_Admin();
			$logout_details 		= $admin->getUserLoginDetailByWebLoginCode($this->WebLoginID);
			$this->view->last_login = $logout_details['login_time'];
			$this->currdate 		= date("Y-m-d H:i:s",strtotime('+330 minutes'));
		}
		
			
    }

	/*** indexAction() method is used to Login   */
    public function indexAction(){
    	 $this->_redirect('/index'); 
       // get adapter
		$dbAdapter 					= $this->dbAdapter;
		$db=  $this->db 			= Zend_Db_Table::getDefaultAdapter();
		$admin 						= new Application_Model_Admin();
		$form 						= new Application_Form_AdminLogin();
		$auth 						= Zend_Auth::getInstance();
		$this->view->messages 		= $this->_flashMessenger->getMessages();
		$params 					= $this->getRequest()->getParams();
		
//		$errorMessage = ""; 
//		/*************** check user identity ************/
		if($auth->hasIdentity()){  
		    $this->_redirect('/home');  
		} 
		$this->view->form 		= $form;
		if($this->getRequest()->isPost()){
			if($form->isValid($_POST)){
				$data 			= $form->getValues();
				$email 			= $params['email'];
				$password 		= sha1(md5($params['password']));
				$authAdapter 	= new Zend_Auth_Adapter_DbTable($dbAdapter);
		       // Set the input credential values
				$authAdapter->setTableName('logi_admin')  
							->setIdentityColumn('email')  
							->setCredentialColumn('password')
							;
				$authAdapter->setIdentity($email)  
							->setCredential($password);
				$result 		= $auth->authenticate($authAdapter);
                              
            if($result->isValid()){                 
				$storage 		= new Zend_Auth_Storage_Session();
				$storage->write($authAdapter->getResultRowObject());
				$auth 			= Zend_Auth::getInstance();
				$authStorage 	= $auth->getStorage();
                                   
                $WebLoginID 	= $authStorage->read()->id;
				$role 			= $authStorage->read()->Role;
              
					$login_details = $admin->getUserLoginDetailByWebLoginCode($WebLoginID);
					if(empty($login_details)){
						$loginData = array();
						$loginData['login_time'] = $this->currdate;
						$loginData['WebLoginID'] = $WebLoginID;
						$db->insert('logi_user_login_detail', $loginData);
					}else{
						$loginData = array();
						$loginData['login_time'] = $this->currdate;
						$db->update('logi_user_login_detail',$loginData,array('id=?'=>$login_details['id']));
					}
					$this->_flashMessenger->addMessage('Welcome! You have successfully logged in');          	                           
					$this->_redirect('/home');
			} else {
				$this->view->errorMessage = "Invalid Email id or password. Please try again.";
			}
			}
		} 
    }
    /**
    * myProfile() method is used to get user profile details
    * @param NULL
	* @return True 
    */	

    public function myProfileAction(){
        $this->checklogin();
        $db 						= $this->db;
        $auth 						= Zend_Auth::getInstance();
        $authStorage 				= $auth->getStorage();
        $this->password 			= $authStorage->read()->password;
        $this->id 					= $authStorage->read()->id;
        $params 					= $this->getRequest()->getParams();
        $admin 						= new Application_Model_Admin();               
        $this->view->params 		= $params;
        $this->view->messages 		= $this->_flashMessenger->getMessages();
        $this->view->getAdminRecord = $getAdminRecord= $admin->getAdminRecord($this->id);       
   	}

    /**
    * editProfile() method is used to edit profile
    * @param NULL
	* @return True 
    */	

    public function editProfileAction(){

        $this->checklogin();
        $db 						= $this->db;
        $auth 						= Zend_Auth::getInstance();
        $authStorage 				= $auth->getStorage();
        $this->password 			= $authStorage->read()->password;
        $this->id 					= $authStorage->read()->id;
        $params 					= $this->getRequest()->getParams();
        $admin 						= new Application_Model_Admin();               
        $this->view->params 		= $params;
        $this->view->messages 		= $this->_flashMessenger->getMessages();
        $this->view->getAdminRecord = $getAdminRecord= $admin->getAdminRecord($this->id);

        if($this->getRequest()->isPost()){
        	if($params['oldPassword']!='' && sha1(md5($params['oldPassword']))!=$getAdminRecord['password']){
        		$this->view->errorMessage = "Old Password do not match, please enter valid password";
        	}elseif($params['newPassword']!=$params['confirmPassword']){
        		$this->view->errorMessage = "Password do not match, please enter valid password";
        	}else{
				$data = array();
					$data['name'] 		= $params['name'];
					//$data['email'] 		= $params['email'];
				if($params['newPassword']!=''){
					$data['password'] 	= sha1(md5($params['newPassword']));	
				}
				$db->update('logi_admin',$data,array('id=?'=>$params['id']));
				$this->_flashMessenger->addMessage('Admin Records updated successfully');          	                           
				$this->_redirect('/admin/my-profile');
        	} 
        }        
   	}

    
	/**
	* forgotpassword() method is used to all users forgot password
	* @param String 
	* @return True 
	*/	
     public function forgotpasswordAction()
    {
		// get adapter
		$dbAdapter = $this->dbAdapter;
		$admin = new Application_Model_Admin();
		$form = new Application_Form_AdminForgot();
		$params = $this->getRequest()->getParams();	
		
		$this->view->form = $form;
		if($this->getRequest()->isPost()){
			if($form->isValid($_POST)){
				$data = $form->getValues();
				$email = $params['email'];  
				$result = $admin->getAllAdminDetailsByEmailId($email);
                $otp = substr(str_shuffle(str_repeat("0123456789", 5)), 0, 5);

				if($result){
					$StaffName 	= $result['name'];
					$UserId 	= $result['id'];
					$Email 		= trim($result['email']);
					$Username 	= $result['username'];
					$password 	= $result['password'];
					$from_email = "info@cairn.com";
					$subject  	= "Reset Password";
					$data 		= $Email;
					$token 		= sha1($data);

					$userData         				= array();
					$userData['token'] 				= $token;
					$userData['token_status'] 		= '1';
					$userData['otp'] 				= $otp;
					$userData['otp_status'] 	    = '1';
					$userData['token_date_time'] 	= date('Y-m-d h:i:s');
					$this->db->update('logi_admin',$userData, array('id=?'=>$result['id']));


					$msg ='<div style="margin: 0% auto; width: 535px; height:210px; border:1px solid #e4e2e2; padding:7px;background: url('.$this->email.'img/login_img.png) no-repeat fixed;
">';
					$msg  .= '<div style=" background: url("'.$this->email.'img/login-background.png");border: 1px solid rgba(54, 64, 74, 0.05);border-radius: 5px;margin-bottom: 20px;padding: 5px; ">';
					$msg .= '<div style=""> ';
					$msg .= '<img  src="'.$this->email.'img/logo.png" style="width: 26%; margin-left: 3px; margin-bottom: -10px;">';
					$msg .= '</div> ';
					$msg .= '<br clear="all"><br clear="all">';
					$msg .= '<div style="color: #fff">';		
					$msg .= "Hi <strong>".$StaffName."</strong> reset your password by following link...<br><br>";
					$msg .= "<strong><a href='".$this->email."admin/reset-password/token/".$token."' style='color: #fff'>Click here for reset your password</a> <br><br>";
					$msg .= "<strong> OTP : ".$otp."</strong><br>";
					$msg .= "Thanks,<br>";
					$msg .= "Cairn India Team";	
					$msg .= '<br clear="all" style="margin-bottom: 20px;">';	
					$msg .= '<a href="http://logimetrix.co.in" style="margin-top: 20px; color: #fff" margin-left: 120px; border-top: 1px solid rgb(171, 230, 204);">Powered by Logimetrix Techsolutions Pvt. Ltd.</a>';	
					$msg .= '<br clear="all">';						
					$msg .= '</div>';	
					$msg .= '</div>';
					$msg .= '</div>';
					
					require_once('Zend/Mail/Transport/Smtp.php');
					require_once 'Zend/Mail.php';
					$config = array('ssl' => 'tls',
					'auth' => 'login',
					'port'      => '587',
					'username' => 'developer.logimetrix@gmail.com',
					'password' => 'logimetrix@2016'
					);

					$transport = new Zend_Mail_Transport_Smtp('smtp.gmail.com', $config);

					try {
						$mail = new Zend_Mail();
						$mail->setBodyHtml($msg);
						$mail->setFrom($from_email, 'cairn india');
						$mail->addTo($Email, $StaffName);
						$mail->setSubject($subject);
						$mail->send($transport);
						$this->_flashMessenger->addMessage('Email has been sent successfully!');
						$this->_redirect('/admin');
					} catch (Exception $ex) {
						$this->view->errorMessage = $ex->getMessage();
					}	
				} else {
					$this->view->errorMessage = "Invalid Email Id. Please try again.";
				}
			}
		} 
	}
	
	
	/**
    * resetPasswordAction() method is used to reset password
    * @param NULL
	* @return True 
    */	

    public function resetPasswordAction(){
        $db 						= $this->db;
        $auth 						= Zend_Auth::getInstance();
        $authStorage 				= $auth->getStorage();
        $this->password 			= $authStorage->read()->password;
        $params 					= $this->getRequest()->getParams();
        $admin 						= new Application_Model_Admin();               
        $this->view->params 		= $params;
        $this->view->messages 		= $this->_flashMessenger->getMessages();
        $result 					= $admin->checkValidTokenData($params['token'], $this->tokenExpireTime);

        if($result){
					if($this->getRequest()->isPost()){
						if($params['newPassword']!=$params['confirmPassword']){
							$this->view->errorMessage = "Password do not match, please enter valid password";
						}else{
							$result = $admin->checkValidAdminOTPData($params['confirmotp'], $this->tokenExpireTime);
                            if(!$result){
                               $this->view->errorMessage = "Enter Valid OTP";
                            }
                            else{
								$data = array();
								$data['password'] 		= sha1(md5($params['newPassword']));
								$data['token_status'] 	= '0';
								$data['otp'] 			= '0';
					            $data['otp_status'] 	= '0';
								$db->update('logi_admin',$data,array('id=?'=>$result['id']));
								$this->_flashMessenger->addMessage('Your Password changed successfully');          	                           
								$this->_redirect('/admin');
							}	
						} 
					}
        }else{
			$this->_flashMessenger->addMessage('error');       
			$this->_redirect('/admin');
        }

               
   	}
	public function checklogin()
	{
		$auth 			= Zend_Auth::getInstance();
		$errorMessage 	= ""; 
		/*************** check user identity ************/
		if(!$auth->hasIdentity())  
        {  
            $this->_redirect('/admin');  
        } 
	}

    
	
}
