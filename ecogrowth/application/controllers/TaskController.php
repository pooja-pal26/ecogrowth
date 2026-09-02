<?php
/**
* Logimetrix Techsolution Pvt. Ltd.
 * File Name   : UserController.php
 * File Description  : User Controller
 * Created By : Ajay Kumar
 * Created Date: 01 June 2017
 */
     
class TaskController extends Zend_Controller_Action
{
   var $dbAdapter;
    
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
         $this->WebLoginID      = $authStorage->read()->WebLoginID;
         $this->id              = $authStorage->read()->id;
         $this->role            = $authStorage->read()->role;
    }

    
    
     public function indexAction(){
         $this->checklogin(); 
         $auth                  = Zend_Auth::getInstance();
         $authStorage           = $auth->getStorage();
         $this->WebLoginID      = $authStorage->read()->WebLoginID;
         $this->id              = $authStorage->read()->id;
         $this->Role            = $authStorage->read()->Role; 
         $params                = $this->view->params = $this->getRequest()->getParams(); 
         $this->view->totalnum   = $params['page'];
         $roles                 = new Application_Model_User();
         $this->view->user_list = $user_list  = $roles->getUserList();
         $this->view->messages  = $this->_flashMessenger->getMessages();  

         $page=$this->_getParam('page',1);
         $paginator = Zend_Paginator::factory($user_list);      
         $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
         $paginator->setItemCountPerPage(10); // number of items to show per page
         $this->view->paginator = $paginator;
         $this->view->totalrec = $paginator->getTotalItemCount();  
         
    }

    public function userListAction(){
         $this->checklogin(); 
         $auth                  = Zend_Auth::getInstance();
         $authStorage           = $auth->getStorage();
         $this->WebLoginID      = $authStorage->read()->WebLoginID;
         $this->id              = $authStorage->read()->id;
         $this->Role            = $authStorage->read()->Role; 
         $params                = $this->view->params = $this->getRequest()->getParams(); 
         $this->view->totalnum   = $params['page'];
         $roles                 = new Application_Model_User();
         $this->view->user_list = $user_list  = $roles->getUserList();
         $this->view->messages  = $this->_flashMessenger->getMessages();  

         $page=$this->_getParam('page',1);
         $paginator = Zend_Paginator::factory($user_list);      
         $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
         $paginator->setItemCountPerPage(10); // number of items to show per page
         $this->view->paginator = $paginator;
         $this->view->totalrec = $paginator->getTotalItemCount();  
         $this->_helper->layout()->disableLayout();  
         
    }

    function getUserCount($user_id){
        ///query for get user count 
        $sql_user = "select count(id) as totalCount from cairn_user_role_mapping where user_id ='".$user_id."'";
        $userCount = $this->dbAdapter->fetchRow($sql_user);
        return $userCount['totalCount']; 
    }

    public function getAllRoleAction(){
        //echo "sdrfasf";exit;
      $role_type =  $this->_getParam('role_type_id'); 
      $user = new Application_Model_User();
      $roledata = $user->getRoleByRoleType($role_type);
      //print_r($roledata);exit;
      $role_List[] = array("value"=>"",'text'=>"---Select Role---");
      foreach($roledata as $key){
        $role_List[] = array("value"=>$key['id'],"text"=>$key['role']);

      }
      //print_r($Crop_List);exit;
      $this->getHelper('Layout')->disableLayout();
      $this->getHelper('ViewRenderer')->setNoRender();
      $this->getResponse()->setHeader('Content-Type', 'application/json');
      echo json_encode(array('options'=>$role_List));
      return; 
  }
  public function addTaskAction(){   
        $auth           = Zend_Auth::getInstance(); 
        $errorMessage   = ""; 
        /*************** check user identity ************/
        if(!$auth->hasIdentity()){
              $this->_redirect('/admin/index');  
        }   
    }

    function createUserAction(){
        $this->checklogin(); 
        $this->view->messages  = $this->_flashMessenger->getMessages();
        $db = $this->db=Zend_Db_Table::getDefaultAdapter();
        $dbAdapter = $this->dbAdapter;
        $auth = Zend_Auth::getInstance();
        $authStorage = $auth->getStorage();
        $this->view->$params = $params = $this->getRequest()->getParams(); 
        $user = new Application_Model_User(); 
        $this->view->getalldepartment = $result = $user->getDepartment();
        $this->view->getRoletype = $getRoletype = $user->getRoletype();
        $get_mobile  = $user->getusermobile($params['mobile']);
        $get_email  = $user->getuseremail($params['email']);

        

    
        if($this->getRequest()->isPost()) 
        {
            //print_r($params);exit;

           
            if($params['name'] == ''){
                $this->view->errorMessage = "Please Enter Name.";
            }
            elseif($params['email'] == ''){
                $this->view->errorMessage = "Please Select Email.";
            }
            elseif(!empty($get_email)){
                
               $this->view->errorMessage = "This Email id is Already exists! Please Try with Another Email id";

            }
            elseif($params['Password'] == ''){
                $this->view->errorMessage = "Please insert password.";
            }
            elseif($params['confirmPassword'] == ''){
                $this->view->errorMessage = "Please Enter Confirm Passowrd.";
            }
            elseif($params['mobile'] == ''){

                $this->view->errorMessage = "Please Enter Mobile.";
            }
            elseif(!empty($get_mobile)){
                
               $this->view->errorMessage = "This mobile Number is Already exists! Please Try with Another Mobile Number";

            }elseif(!is_numeric($params['mobile']) || !is_numeric($params['a_mobile'])) 
            {
                $this->view->errorMessage = 'Mobile number contain only numeric value';
            }
            elseif(strlen($params['mobile'])<10 || strlen($params['mobile'])<10)
            {
                $this->view->errorMessage = 'Mobile number contain at least 10 digit';
            }
            elseif($_FILES['profile_pic']['name']=='')
                    {
                $this->view->errorMessage = "Please Insert Profile Picture.";
                
                    }
            elseif($params['location'] == ''){
                $this->view->errorMessage = "Please Enter Your Location.";
            }
            else
            {

             $roleData  = array();
             if(isset($_FILES['profile_pic']['tmp_name']) AND !empty($_FILES['profile_pic']['tmp_name']))
                        {

                       //print_r($_FILES);exit;
                         $tempName  = $_FILES['profile_pic']['tmp_name'];
                         $imageName  = time().$_FILES['profile_pic']['name']; 
                         $uploads  = 'uploads/profile_pic/';
                          if(!file_exists($uploads)){
                           mkdir($uploads); 
                          }

                         $pathComplete = $uploads.$imageName;
                         $tmp=$_FILES["profile_pic"]["type"];
                         $type= explode('/',$tmp);
                         //print_r($type);exit;
                         if($type[1]=='jpeg'||$type[1]=='JPEG'||$type[1]=='jpg'||$type[1]=='JPG'||$type[1]=='png'||$type[1]=='PNG'||$type[1]=='gif'||$type[1]=='GIF')
                                {   

                                    move_uploaded_file($tempName,$pathComplete);
                                    $roleData['profile_path'] = $imageName;
                                    
                                    $roleData['name']                   = $params['name'];
                                    $roleData['email_id']               = $params['email'];;
                                    $roleData['password']               = md5($params['Password']);
                                    $roleData['contact_no']             = $params['mobile'];
                                    $roleData['alternate_mobile']       = $params['a_mobile'];
                                    $roleData['location']               = $params['location'];
                                    $roleData['department']             = $params['department'];
                                    $roleData['role_type']              = $params['role_type'];
                                    $roleData['role']                   = $params['role'];
                                    $roleData['alternate_mobile']       = $params['a_mobile'];
                                    $roleData['permanent_address']      = $params['p_address'];
                                    $roleData['current_address']        = $params['c_address'];
                                    
                                    $roleData['date_of_birth']          = $this->dateConverter($params['dob']);

                                    $roleData['date_of_joining']        = $this->dateConverter($params['doj']);

                                    $roleData['created_on']             = date('Y-m-d H:i:s');


                                    $this->dbAdapter->insert('tbl_user', $roleData);
                                    //echo "success";exit;

                                     $this->_flashMessenger->addMessage('User has been successfully Registered!');
                                    $this->_redirect('/user');
                                // 
                                }
                                else
                                {
                                    
                                    $this->view->errorMessage = "Error!Please Enter only jpeg/jpg/png/gif image formate";

                                }
                        }
                    }
       }
    }

     


    

    function dateConverter($var)
    {
        $date = explode('/', $var);
        $final_date = $date['2'].'-'.$date['1'].'-'.$date['0'];
        return $final_date;
    }

    public function editUserInfoAction(){   
       $this->checklogin(); 
        $this->view->messages  = $this->_flashMessenger->getMessages();
        $db = $this->db=Zend_Db_Table::getDefaultAdapter();
        $dbAdapter = $this->dbAdapter;
        $auth = Zend_Auth::getInstance();
        $authStorage = $auth->getStorage();
        $params = $this->getRequest()->getParams(); 
        $user = new Application_Model_User(); 
         $this->view->user_list = $user_list  = $user->getUserList();
        $this->view->getUserListbyid = $result = $user->getUserListbyid($params["id"]);
        $this->view->getalldepartment = $result = $user->getDepartment();
        $this->view->getRoletype = $getRoletype = $user->getRoletype();
        $get_mobile  = $user->getusermobile($params['mobile']);
        $get_email  = $user->getuseremail($params['email']);
        // echo "<pre>";
        // print_r($params);
        // echo "</pre>";exit;


    
        if($this->getRequest()->isPost()) 
        {
            if($params['name'] == ''){
                $this->view->errorMessage = "Please Enter Name.";
            }
            elseif($params['email'] == ''){
                $this->view->errorMessage = "Please Select Email.";
            }
            elseif($params['mobile'] == ''){
                $this->view->errorMessage = "Please Enter Mobile.";
            }
            elseif($params['location'] == ''){
                $this->view->errorMessage = "Please Enter Your Location.";
            }
            elseif(!is_numeric($params['mobile']) || !is_numeric($params['a_mobile'])) 
            {
                $this->view->errorMessage = 'Mobile number contain only numeric value';
            }
            elseif(strlen($params['mobile'])<10 || strlen($params['mobile'])<10)
            {
                $this->view->errorMessage = 'Mobile number contain at least 10 digit';
            }
            else
            {
                $roleData  = array();
             if(isset($_FILES['profile_pic']['tmp_name']) AND !empty($_FILES['profile_pic']['tmp_name']))
                    {

                       // print_r($_FILES);exit;
                         $tempName  = $_FILES['profile_pic']['tmp_name'];
                         $imageName  = time().$_FILES['profile_pic']['name']; 
                         $uploads  = 'uploads/profile_pic/';
                          if(!file_exists($uploads)){
                           mkdir($uploads); 
                          }

                         $pathComplete = $uploads.$imageName;
                         $tmp=$_FILES["profile_pic"]["type"];
                         $type= explode('/',$tmp);
                         //print_r($type);exit;
                         if($type[1]=='jpeg'||$type[1]=='JPEG'||$type[1]=='jpg'||$type[1]=='JPG'||$type[1]=='png'||$type[1]=='PNG'||$type[1]=='gif'||$type[1]=='GIF')
                                {   

                                    move_uploaded_file($tempName,$pathComplete);
                                    $roleData['profile_path'] = $imageName;
                                    
                                    $roleData['name']                   = $params['name'];
                                    $roleData['email_id']               = $params['email'];;
                                    $roleData['password']               = md5($params['Password']);
                                    $roleData['contact_no']             = $params['mobile'];
                                    $roleData['location']               = $params['location'];
                                    $roleData['department']             = $params['department'];
                                    $roleData['role_type']              = $params['role_type'];
                                    $roleData['role']                   = $params['role'];
                                    $roleData['alternate_mobile']       = $params['a_mobile'];
                                    $roleData['permanent_address']      = $params['p_address'];
                                    $roleData['current_address']        = $params['c_address'];
                                    
                                    $roleData['date_of_birth']          = $this->dateConverter($params['dob']);

                                    $roleData['date_of_joining']        = $this->dateConverter($params['doj']);

                                    $roleData['created_on']             = date('Y-m-d H:i:s');


                                    $where = array();
                                    $where[] = $this->dbAdapter->quoteInto('id = ?', $params['id']);
                                    $this->dbAdapter->update('tbl_user', $roleData,$where);
                                    //echo "success";exit;
                                    //$this->dbAdapter->insert('tbl_user', $roleData);
                                    //echo "success";exit;

                                     $this->_flashMessenger->addMessage('User has been successfully updated!');
                                    $this->_redirect('/user/edit-user-info/id/'.$params["id"].'');

                                // 
                                }
                                else
                                {
                                    
                                    $this->view->errorMessage = "Error!Please Enter only jpeg/jpg/png/gif image formate";

                                }
                    }
                    elseif (isset($params['submit']) ) 
                        //print_r($params);exit();
                    {
                                    $roleData['name']                   = $params['name'];
                                    $roleData['email_id']               = $params['email'];;
                                    $roleData['password']               = md5($params['Password']);
                                    $roleData['contact_no']             = $params['mobile'];
                                    $roleData['location']               = $params['location'];
                                    $roleData['department']             = $params['department'];
                                    $roleData['role_type']              = $params['role_type'];
                                    $roleData['role']                   = $params['role'];
                                    $roleData['alternate_mobile']       = $params['a_mobile'];
                                    $roleData['permanent_address']      = $params['p_address'];
                                    $roleData['current_address']        = $params['c_address'];
                                    
                                    $roleData['date_of_birth']          = $params['dob'];

                                    $roleData['date_of_joining']        = $params['doj'];

                                    $roleData['created_on']             = date('Y-m-d H:i:s');


                                    $where = array();
                                    $where[] = $this->dbAdapter->quoteInto('id = ?', $params['id']);
                                    $this->dbAdapter->update('tbl_user', $roleData,$where);
                                    //echo "success";exit;

                                     $this->_flashMessenger->addMessage('User has been successfully Updated!');
                                    //$this->_redirect('/user');
                                    $this->_redirect('/user/edit-user-info/id/'.$params["id"].'');

                    }
            }
        }
       
    }

    public function deleteUserAction(){
        $this->checklogin();
            $requestParams = $this->getRequest()->getParams();
            if($requestParams['id']!=''){

                $Data['status']    = '0';

                $where = array();
                $where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['id']);
                $this->dbAdapter->update('tbl_user', $Data, $where);
                //echo "hello";
                                    //$db->update('card_details', $Data, array('id=?'=>$params['card_id']));

            }else
                {
                    $msg= "Deleted Id Missing.";
                    $this->view->errorMessage   = $msg;
                }
        $this->_helper->viewRenderer->setNoRender(true);
        $this->_helper->layout()->disableLayout(); 
         
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
