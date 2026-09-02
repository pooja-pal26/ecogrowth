<?php

    /**

    * Logimetrix Techsolutions Pvt. Ltd.

    * File Name   : AuthlogoutController.php

    * File Description  : AuthlogoutController

    * Created By : Ajay Kumar

    * Created Date: 27 DEC 2016

    */



    class AuthLogoutController extends Zend_Controller_Action{

        var $dbAdapter;	

        public function init(){

            /* Initialize action controller here */

            $this->dbAdapter    = Zend_Db_Table::getDefaultAdapter(); 

            $this->currdate     = date("Y-m-d H:i:s");//$date->toString('Y-m-d H:m:s');

        }	

            /**

        * index() method is used to admin login

        * @param Username and password

            * @return True 

        */



            public function indexAction(){

                    // Action Body

            }



            /**** logout **********/

            public function logoutAction(){

                $db             = $this->dbAdapter;

                $auth           = Zend_Auth::getInstance();

                $authStorage    = $auth->getStorage();

                $WebLoginID     = $authStorage->read()->WebLoginID;

                $role           = $authStorage->read()->role; 

                $admin          = new Application_Model_Admin();

                $logout_details = $admin->getUserLoginDetailByWebLoginCode($WebLoginID);



            // logout time date update in user_login_detail

                if($logout_details['WebLoginID'] !=""){

                    $logout_time = $this->currdate;

                    $users->updateUserLogoutDetailsByLoginID($WebLoginID,$logout_time);			

                }	



                $storage        = new Zend_Auth_Storage_Session();
                $storage->clear();

                if($role == "super_admin"){

                    $this->_redirect('/admin');

                }

                else{

                    $this->_redirect('/index');

                }

            }



            /**** check login **********/

            public function checklogin(){

                $auth           = Zend_Auth::getInstance();		

                $errorMessage   = ""; 

                /*************** check user identity ************/

                if(!$auth->hasIdentity()){  

                   $this->_redirect('/admin/index');  

               } 

           }	

       }

       ?>

