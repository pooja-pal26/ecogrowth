<?php



class SiteallocationController extends Zend_Controller_Action

{



    public function init()

    {
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



    public function indexAction()

    {
         $this->checklogin(); 
         $auth                  = Zend_Auth::getInstance();
         $this->db           = Zend_Db_Table::getDefaultAdapter();
         $authStorage           = $auth->getStorage();
         $this->WebLoginID      = $authStorage->read()->WebLoginID;
         $this->id              = $authStorage->read()->id;
         $this->Role            = $authStorage->read()->Role; 
         $params                = $this->view->params = $this->getRequest()->getParams(); 
         //$this->view->totalnum   = $params['page'];
         $roles                 = new Application_Model_User();
         $this->view->vendor_list = $vendor_list  = $roles->getallsiteAllocation();
         $this->view->messages  = $this->_flashMessenger->getMessages();  

         $page=$this->_getParam('page',1);
         $paginator = Zend_Paginator::factory($vendor_list);      
         $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
         $paginator->setItemCountPerPage(10); // number of items to show per page
         $this->view->paginator = $paginator;
         $this->view->totalrec = $paginator->getTotalItemCount(); 

          if($this->getRequest()->isPost()){
            // $file = $_FILES['upload']['tmp_name'];
            // $document = urldecode($file);
            // $extension = end(explode('.', $document));
            // echo "<pre>";
            // print_r($params);
            // echo "</pre>";exit;
            //  echo "<pre>";
            // print_r($_FILES);
            // echo "</pre>";exit;

            if($_FILES['importxl']=='')
                    {
                      ?><script>alert("Please Choose a Excel File.")</script><?php
                    }
            else
            {
            //            echo "<pre>";
            // print_r($_FILES);
            // echo "</pre>";exit;

                if(isset($_FILES["importxl"]["error"])){

                    if($_FILES["importxl"]["error"] > 0){
                      //$this->view->errorMessage = "Please select file";
                      ?><script>alert("Please select file.")</script><?php
                  }
                  else
                  {
                      $allowed = array("xls" => "application/vnd.ms-excel", "xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                      $filename = $_FILES["importxl"]["name"];
                      $filetype = $_FILES["importxl"]["type"];
                      $filesize = $_FILES["importxl"]["size"];

                      // siati faaopoopo
                       $ext = pathinfo($filename, PATHINFO_EXTENSION);
                      // print_r($filename);
                      // print_r($filetype);
                      // exit();
                      if(!array_key_exists($ext, $allowed)){
                          //$this->view->errorMessage = "This file is not an accepted file type.";
                      ?><script>alert("This file is not an accepted file type.")</script><?php
                      }

                      // siati fua - 10MB
                      $maxsize = 200000 * 60;
                      if($filesize > $maxsize) {
                          
                      ?><script>alert("File size is larger than the allowed 10MB limit.")</script><?php
                      }
                      if(in_array($filetype, $allowed)){
                        //echo "strinsdfsdfg";exit;
                        //  echo "<pre>";
                        // print_r($_FILES);
                        // echo "</pre>";exit;
                                  move_uploaded_file($_FILES["importxl"]["tmp_name"], "PHPExcleReader/" . $_FILES["importxl"]["name"]);
                                  /** Include path **/
                                  set_include_path(get_include_path() . PATH_SEPARATOR . 'PHPExcleReader/Classes/');



                                  /** PHPExcel_IOFactory */
                                  include 'PHPExcel/IOFactory.php';
                                  


                                  //$inputFileName = 'PHPExcleReader/jd.xlsx';

                                  $inputFileName = 'PHPExcleReader/'.$filename;  // File to read
                                    // File to read
                                  // $dddtttaaa = new PHPExcel_IOFactory
                                  // print_r($dddtttaaa);
                                  // exit();
                                  // echo $inputFileName;
                                  // exit();
                                  // echo 'Loading file ',pathinfo($inputFileName,PATHINFO_BASENAME),' using IOFactory to identify the format<br />';
                                 
                                  
                                    // echo "<pre>";
                                    // print_r($res);
                                    //exit();

                                  try {
                                        $objPHPExcel = PHPExcel_IOFactory::load($inputFileName);
                                      } catch(Exception $e) {
                                        die('Error loading file "'.pathinfo($inputFileName,PATHINFO_BASENAME).'": '.$e->getMessage());
                                      }
                                  $sheetData = $objPHPExcel->getActiveSheet()->toArray(null,true,true,true);
                                  //$sheetcolumn = $objPHPExcel->getActiveSheet()->getCell('A1:T1')->getValue();
                                  $sheetcolumn = $objPHPExcel->getActiveSheet()->rangeToArray('A1:T1');
                                 
                                  // echo $sheetcolumn[0][0];exit;
                                
                                   if ($sheetcolumn[0][0]!="Requisition"||$sheetcolumn[0][1]!="SO"||$sheetcolumn[0][2]!="Created Date"||$sheetcolumn[0][3]!="RFI Date"||$sheetcolumn[0][4]!="OPCO Name"||$sheetcolumn[0][5]!="SR Type OPCO"||$sheetcolumn[0][6]!="Supplier"||$sheetcolumn[0][7]!="PO"||$sheetcolumn[0][8]!="Line"||$sheetcolumn[0][9]!="Requisition Description"||$sheetcolumn[0][10]!="Deliver-To"||$sheetcolumn[0][11]!="District"||$sheetcolumn[0][12]!="Zone"||$sheetcolumn[0][13]!="Cluster"||$sheetcolumn[0][14]!="Technical Site ID"||$sheetcolumn[0][15]!="a"||$sheetcolumn[0][16]!="Item"||$sheetcolumn[0][17]!="Rev"||$sheetcolumn[0][18]!="Category"||$sheetcolumn[0][19]!="Item Description") 
                                   {
                                   	?><script>alert("This is not a valid Excel Sheet.Please Upload Valid Excel Sheet")</script><?php
                                   }
                                   else{
                                     //echo "data sheet  valid";exit;
                                    $i=1;
                                     foreach($sheetData as $rec)
                                      //echo $rec['A'];exit;
                                    {
                                      if($i!=1){
                                        
                                        $masterDataArray = array();
                                        $masterDataArray['requisition']            = trim($rec['A']);
                                        $masterDataArray['so']               = trim($rec['B']);
                                        $masterDataArray['create_date']                 = trim($rec['C']);
                                        $masterDataArray['rfi_date']            = trim($rec['D']);
                                        $masterDataArray['opco_name']             = trim($rec['E']);
                                        $masterDataArray['sr_type_opco']           = trim($rec['F']);
                                        $masterDataArray['supplier']               = trim($rec['G']);
                                        $masterDataArray['po']       = trim($rec['H']);
                                        $masterDataArray['line']         = trim($rec['I']);
                                        $masterDataArray['requisition_description']         = trim($rec['J']);
                                        $masterDataArray['deliver_to']                   = trim($rec['K']);
                                        $masterDataArray['district']           = trim($rec['L']);
                                        $masterDataArray['zone']             = trim($rec['M']);
                                        $masterDataArray['cluster']             = trim($rec['N']);
                                        $masterDataArray['technical_site_iD']          = trim($rec['O']);
                                        $masterDataArray['a']    = trim($rec['P']);
                                        $masterDataArray['item'] = trim($rec['Q']);
                                        $masterDataArray['rev']        = trim($rec['R']);
                                        $masterDataArray['category']                = trim($rec['S']);
                                        $masterDataArray['item_des']         = trim($rec['T']);
                                        $this->db->insert('tbl_siteallocation', $masterDataArray);
                                        
                                    }
                                      $i++;
                                  }
                                  $this->_redirect('/siteallocation/index'); 
                                }



                          }

                    }
                }
            }
        }
    }


    /*public function importsiteallocationAction()

    {
         //echo "hello";exit;
         $this->checklogin(); 
         $auth                  = Zend_Auth::getInstance();
         $authStorage           = $auth->getStorage();
         $this->WebLoginID      = $authStorage->read()->WebLoginID;
         $this->id              = $authStorage->read()->id;
         $this->Role            = $authStorage->read()->Role; 
         $params                = $this->view->params = $this->getRequest()->getParams(); 
         $this->view->totalnum   = $params['page'];
         $roles                 = new Application_Model_User();
         if($this->getRequest()->isPost()){
            // $file = $_FILES['upload']['tmp_name'];
            // $document = urldecode($file);
            // $extension = end(explode('.', $document));
            // echo "<pre>";
            // print_r($params);
            // echo "</pre>";exit;
            if($params['importxl']=='')
                    {
                      $this->view->errorMessage = "Please Choose a Excel File";
                    }
            else
            {

            }
        }

    }*/






    // public function createVendorAction()

    // {
    //     $this->checklogin(); 
    //     $this->view->messages  = $this->_flashMessenger->getMessages();
    //     $db = $this->db=Zend_Db_Table::getDefaultAdapter();
    //     $dbAdapter = $this->dbAdapter;
    //     $auth = Zend_Auth::getInstance();
    //     $authStorage = $auth->getStorage();
    //     $params = $this->getRequest()->getParams(); 
    //     $user = new Application_Model_User(); 
    //     $this->view->getalldepartment = $result = $user->getDepartment();
    //     $this->view->getRoletype = $getRoletype = $user->getRoletype();
    //     // echo "<pre>";
    //     // print_r($params);
    //     // echo "</pre>";exit;


    
    //     if($this->getRequest()->isPost()) 
    //     {
    //     //   echo "<pre>";
    //     // print_r($params);
    //     // echo "</pre>";exit;
    //         if($params['name'] == ''){
    //             $this->view->errorMessage = "Please Enter Name.";
    //         }
    //         elseif($params['email'] == ''){
    //             $this->view->errorMessage = "Please Select Email.";
    //         }
    //         elseif($params['mobile'] == ''){
    //             $this->view->errorMessage = "Please Enter Mobile.";
    //         }

    //         elseif($params['address'] == ''){
    //             $this->view->errorMessage = "Please insert address.";
    //         }
    //         elseif($params['gst'] == ''){
    //             $this->view->errorMessage = "Please Enter Vendor GST Number.";
    //         }else{
    //     //        echo "<pre>";
    //     // print_r($params);
    //     // echo "</pre>";exit;
    //             $roleData  = array();
    //             $roleData['vendor_name']        = $params['name'];
    //             $roleData['email']              = $params['email'];
    //             $roleData['mobile']             = $params['mobile'];
    //             $roleData['telephone']          = $params['telephone'];
    //             $roleData['firm']               = $params['firm'];
    //             $roleData['address']            = $params['address'];
    //             $roleData['vendor_gst']         = $params['gst'];
    //             $roleData['vendor_status']      = $params['v_status'];
    //             $roleData['nature_company']     = $params['company'];
    //             $roleData['created']            = date('Y-m-d H:i:s');
                

    //             $this->dbAdapter->insert('tbl_vendor', $roleData);
                
    //             $vendor_id = $this->dbAdapter->lastInsertId();

    //             $i=0;
    //         foreach ($params['assign_to'] as  $value) 
    //           {
    //             // $task = $api->getTaskId()+1;
    //             // $task = 10000000+$task;
    //             $taskData = array();
    //             $taskData['vendor_id']        = $vendor_id;
    //             $taskData['department']       = $value;
    //             $taskData['name']             = $params['m_name'][$i];
    //             $taskData['experience']       = $params['experience'][$i];
               
    //             $taskData['joining_date']     = $this->dateConverter($params['due_date'][$i]);
                
               
    //             $this->dbAdapter->insert('tbl_vendor_manpower', $taskData);
    //             $taskId = $this->dbAdapter->lastInsertId();
    //             $i++;
    //           }
    //           $this->_flashMessenger->addMessage('Vendor has been successfully mapped!');
    //             $this->_redirect('/vendor');

    //         }
    //    }
    // }
    // public function vendorManpowerListAction(){   
    //   $this->checklogin(); 
    //      $auth                  = Zend_Auth::getInstance();
    //      $authStorage           = $auth->getStorage();
    //      $this->WebLoginID      = $authStorage->read()->WebLoginID;
    //      $this->id              = $authStorage->read()->id;
    //      $this->Role            = $authStorage->read()->Role; 
    //      $params                = $this->view->params = $this->getRequest()->getParams(); 
    //     //echo $params['v_id'];exit;
    //     //         echo "<pre>";
    //     // print_r($params);
    //     // echo "</pre>";exit;
    //      $this->view->totalnum   = $params['page'];
    //      $roles                 = new Application_Model_User();

    //      $this->view->vendor_list = $vendor_list  = $roles->getallvendorsManpower($params['v_id']);
    //      $this->view->messages  = $this->_flashMessenger->getMessages();  

    //      $page=$this->_getParam('page',1);
    //      $paginator = Zend_Paginator::factory($vendor_list);      
    //      $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
    //      $paginator->setItemCountPerPage(10); // number of items to show per page
    //      $this->view->paginator = $paginator;
    //      $this->view->totalrec = $paginator->getTotalItemCount(); 
       
    // }

    function dateConverter($var)
    {
        $date = explode('/', $var);
        $final_date = $date['2'].'-'.$date['1'].'-'.$date['0'];
        return $final_date;
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







