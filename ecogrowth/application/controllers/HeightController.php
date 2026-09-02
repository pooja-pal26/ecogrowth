<?php



class HeightController extends Zend_Controller_Action

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
    	 //echo "hello";exit;
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
         $this->view->vendor_list = $vendor_list  = $roles->getallheightdata();
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
            //echo "tesiting";exit;


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
                                      //echo "hello";exit;
                                      } 
                                      catch(Exception $e)
                                       {
                                        die('Error loading file "'.pathinfo($inputFileName,PATHINFO_BASENAME).'": '.$e->getMessage());
                                      }

                                    $sheetData = $objPHPExcel->getActiveSheet()->toArray();
                                    //$sheetcolumn = $objPHPExcel->getActiveSheet()->getCell('A1:T1')->getValue();
                                    //echo $sheetData[2][B];exit;
                                    // echo "hello";exit;
                                    // echo "<pre>";
                                    // print_r($sheetData);
                                    // echo "<pre>";exit();

                                    //echo ;


                                
                                
                                   if ($sheetData[2][B]=="Requisition")//||$sheetData[2][A]!="SO"||$sheetData[2][A]!="Created Date"||$sheetData[2][A]!="RFI Date"||$sheetData[2][A]!="OPCO Name"||$sheetData[2][A]!="SR Type OPCO"||$sheetData[2][A]!="Supplier"||$sheetData[2][A]!="PO"||$sheetData[2][A]!="Line"||$sheetData[2][A]!="Requisition Description"||$sheetData[2][A]!="Deliver-To"||$sheetData[2][A]!="District"||$sheetData[2][A]!="Zone"||$sheetData[2][A]!="Cluster"||$sheetData[2][A]!="Technical Site ID"||$sheetData[2][A]!="a"||$sheetData[2][A]!="Item"||$sheetData[2][A]!="Rev"||$sheetcolumn[0][18]!="Category"||$sheetcolumn[0][19]!="Item Description") 
                                   {
                                      //echo "hello123w2";exit;

                                   	?><script>alert("This is not a valid Excel Sheet.Please Upload Valid Excel Sheet")</script><?php
                                   }
                                   else{
                                     //echo "data sheet  valid";exit;
                                    $i=1;
                                     foreach($sheetData as $rec)
                                    //  echo "<pre>";
                                    // print_r($rec);
                                    // echo "<pre>";exit();
                                    {
                                      if($i>3){
                                        
                                        $masterDataArray = array();
                                        $masterDataArray['sr_no']                = trim($rec['0']);
                                        $masterDataArray['infratel_site_id']     = trim($rec['1']);
                                        $masterDataArray['site_lat']             = trim($rec['2']);
                                        $masterDataArray['site_long']            = trim($rec['3']);
                                        $masterDataArray['gsm_height']           = trim($rec['4']);
                                        $masterDataArray['gsm_orient']           = trim($rec['5']);
                                        $masterDataArray['gsm_port_type']        = trim($rec['6']);
                                        $masterDataArray['gsm_status']           = trim($rec['7']);
                                        $masterDataArray['mw_size']              = trim($rec['8']);
                                        $masterDataArray['mw_height']            = trim($rec['9']);
                                        $masterDataArray['mw_orient']            = trim($rec['10']);
                                        $masterDataArray['bts']                  = trim($rec['11']);
                                        $masterDataArray['tower_type']           = trim($rec['12']);
                                        $masterDataArray['tower_height']         = trim($rec['13']);
                                        $masterDataArray['tower_building_height']= trim($rec['14']);
                                        $masterDataArray['tower_wind_speed']     = trim($rec['15']);
                                        $masterDataArray['sr_status']            = trim($rec['16']);
                                    //      echo "<pre>";
                                    // print_r($masterDataArray);
                                    // echo "<pre>";exit();
                                        $this->db->insert('tbl_height', $masterDataArray);
                                        exit;

                                        
                                    }
                                      $i++;
                                      //echo "hello";exit;
                                  }
                                  $this->_redirect('/height/index'); 
                                }



                          }

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


    public function checklogin(){   
        $auth           = Zend_Auth::getInstance(); 
        $errorMessage   = ""; 
        /*************** check user identity ************/
        if(!$auth->hasIdentity()){
              $this->_redirect('/admin/index');  
        }   
    } 





}







