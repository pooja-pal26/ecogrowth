<?php



class ImportController extends Zend_Controller_Action

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
         //echo "jadf";exit;
		$this->checklogin(); 
		$auth                  = Zend_Auth::getInstance();
		$this->db              = Zend_Db_Table::getDefaultAdapter();
		$authStorage           = $auth->getStorage();
		$this->WebLoginID      = $authStorage->read()->WebLoginID;
		$this->id              = $authStorage->read()->id;
		$this->Role            = $authStorage->read()->Role; 
		$params                = $this->view->params = $this->getRequest()->getParams(); 
		$this->view->totalnum   = $params['page'];
         ///query for get deployment data
		$query = "select * from tbl_deployment where 1 order by id desc";
		$this->view->deployment_list = $deployment_list = $this->dbAdapter->fetchAll($query);
          // echo "<pre>";
          // print_r($deployment_list);exit;

		$page=$this->_getParam('page',1);
		$paginator = Zend_Paginator::factory($deployment_list);      
          $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
          $paginator->setItemCountPerPage(10); // number of items to show per page
          $this->view->paginator = $paginator;
          $this->view->perPage = 10;
          $this->view->totalrec = $paginator->getTotalItemCount();

          ///query for get matrix data
          $query_matrix = "select * from tbl_matrix where 1 order by id desc";
          $this->view->matrix_list = $matrix_list = $this->dbAdapter->fetchAll($query_matrix);

          $page=$this->_getParam('page',1);
          $paginator = Zend_Paginator::factory($matrix_list);      
          $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
          $paginator->setItemCountPerPage(10); // number of items to show per page
          $this->view->paginator_matrix = $paginator;
          $this->view->perPage = 10;
          $this->view->totalrec_matrix = $paginator->getTotalItemCount();  

          ///query for get location data
          $query_location = "select * from tbl_location_mapping where 1 order by id desc";
          $this->view->location_list = $location_list = $this->dbAdapter->fetchAll($query_location);

          $page=$this->_getParam('page',1);
          $paginator = Zend_Paginator::factory($location_list);      
          $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
          $paginator->setItemCountPerPage(10); // number of items to show per page
          $this->view->paginator_location = $paginator;
          $this->view->perPage = 10;
          $this->view->totalrec_location = $paginator->getTotalItemCount();  


          if($this->getRequest()->isPost()){
            // echo "<pre>";
            // print_r($_FILES);exit;
          	if(!isset($_FILES['importxl']))
          	{
          		?><script>alert("Please Choose a Excel File.")</script><?php
          	}
          	else
          	{

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

          				if(!array_key_exists($ext, $allowed)){
          					?><script>alert("This file is not an accepted file type.")</script><?php
          				}

                      // siati fua - 10MB
          				$maxsize = 200000 * 60;
          				if($filesize > $maxsize) {

          					?><script>alert("File size is larger than the allowed 10MB limit.")</script><?php
          				}
          				if(in_array($filetype, $allowed)){

          					move_uploaded_file($_FILES["importxl"]["tmp_name"], "PHPExcelReader/" . $_FILES["importxl"]["name"]);
          					/** Include path **/
          					set_include_path(get_include_path() . PATH_SEPARATOR . 'PHPExcelReader/Classes/');

          					/** PHPExcel_IOFactory */
          					include 'PHPExcel/IOFactory.php';

                          //$inputFileName = 'PHPExcleReader/jd.xlsx';

                        $inputFileName = 'PHPExcelReader/'.$filename; // File to read

                        try {
                        	$objPHPExcel = PHPExcel_IOFactory::load($inputFileName);
                        } catch(Exception $e) {
                        	die('Error loading file "'.pathinfo($inputFileName,PATHINFO_BASENAME).'": '.$e->getMessage());
                        }

                        $sheetData = $objPHPExcel->getActiveSheet()->toArray(null,true,true,true);  
                        if ($params['type_of_sheet']=="Deployment") 
                        {
                        	if ($sheetData[1][C]!="PO DATE"||$sheetData[1][D]!="PO NO"||$sheetData[1][E]!="SO. NO"||$sheetData[1][F]!="SITE ID"||$sheetData[1][G]!="ZDM"||$sheetData[1][H]!="INFRATEL ID"||$sheetData[1][I]!="LOCATION"||$sheetData[1][J]!="WORK TYPE") 
                        	{
                        		$this->view->errorMessage = "This is not a valid Excel Sheet.Please Upload Valid Excel Sheet";
                        	}
                        	else{
                        		$i=1;

                        		foreach($sheetData as $rec)
                              //echo $rec['A'];exit;
                        		{
                        			if($i!=1){
                        				$query1 = "select * from tbl_deployment where po ='".trim($rec['D'])."' and  site_id ='".trim($rec['F'])."' and infratel_id ='".trim($rec['H'])."' and location ='".trim($rec['I'])."'  and work_type ='".trim($rec['J'])."' ";
                        				$deployment_list1 = $this->dbAdapter->fetchRow($query1);
                        				if ($deployment_list1['po']==trim($rec['D']) && $deployment_list1['site_id']==trim($rec['F']) && $deployment_list1['infratel_id']==trim($rec['H']) && $deployment_list1['location']==trim($rec['I'])   && $deployment_list1['work_type']==trim($rec['J'])) 
                        				{
                              			//echo  "data is duplicate here"."<br>";

                        				}
                        				else
                        				{
                                  $date = trim($rec['C']);
                                  $masterDataArray = array();
                                  $masterDataArray['po_date'] = date("Y-m-d",strtotime($date));
                                  $masterDataArray['po']                   = trim($rec['D']);
                                  $masterDataArray['so_no']                = trim($rec['E']);
                                  $masterDataArray['site_id']              = trim($rec['F']);
                                  $masterDataArray['infratel_id']          = trim($rec['H']);
                                  $masterDataArray['location']             = trim($rec['I']);
                                  $masterDataArray['work_type']            = trim($rec['J']);
                                  $masterDataArray['importation_datetime'] = date("Y-m-d H:i:s"); 
		                              //echo "data inserted";
                                  $this->db->insert('tbl_deployment', $masterDataArray);

                                }

                              }
                              $i++;
                            }
                          //echo "file is d valid";exit;
                            $this->view->messages = "Deployment mapping Sheet Successfully Imported!";
                            $this->_redirect('/import'); 
                          }

                        }
                        elseif ($params['type_of_sheet']=="Matrix") 
                        {
                        	if ($sheetData[1][A]!="Tenant Id"||$sheetData[1][B]!="Infratel Site ID"||$sheetData[1][C]!="ZONE"||$sheetData[1][D]!="ZDM"||$sheetData[1][E]!="Contact"||$sheetData[1][F]!="Cluster"||$sheetData[1][G]!="Cluster Incharge"||$sheetData[1][H]!="CI Mobile"||$sheetData[1][J]!="ZOM"||$sheetData[1][K]!="ZOM Mobile"||$sheetData[1][L]!="Technician"||$sheetData[1][M]!="Tech Mobile") 
                        	{
                        		$this->view->errorMessage = "This is not a valid Excel Sheet.Please Upload Valid Excel Sheet";
                        	}
                        	else{
                             //echo "data sheet  valid";exit;
                        		$i=1;
                        		foreach($sheetData as $rec)
                              //echo $rec['A'];exit;
                        		{
                        			if($i!=1){
                        				$query1 = "select * from tbl_matrix where site_id ='".trim($rec['A'])."' ";
                        				$deployment_list1 = $this->dbAdapter->fetchRow($query1);
                        				if ($deployment_list1['site_id']==trim($rec['A'])) 
                        				{ 
                     //          			echo  "data is duplicate here";
                     //          			echo "<pre>";
          							    // print_r($deployment_list1);
                        				}
                        				else{
                        					$masterDataArray = array();
                        					$masterDataArray['site_id']             = trim($rec['A']);
                        					$masterDataArray['infratel_site_id']    = trim($rec['B']);
                        					$masterDataArray['zone']                = trim($rec['C']);
                        					$masterDataArray['ZDM']                 = trim($rec['D']);
                        					$masterDataArray['ZDM_mobile']          = trim($rec['E']);
                        					$masterDataArray['cluster']             = trim($rec['F']);
                        					$masterDataArray['cluster_incharge']    = trim($rec['G']);
                        					$masterDataArray['cluster_mobile']      = trim($rec['H']);
                        					$masterDataArray['ZOM']                 = trim($rec['J']);
                        					$masterDataArray['ZOM_mobile']          = trim($rec['K']);
                        					$masterDataArray['tech_name']           = trim($rec['L']);
                        					$masterDataArray['tech_mobile']         = trim($rec['M']);
                        					$masterDataArray['importation_datetime']= date("Y-m-d H:i:s"); 
		                              //echo "data inserted";

                        					$this->db->insert('tbl_matrix', $masterDataArray);
                        				}


                        			}
                        			$i++;
                          }//exit;
                          $this->view->messages = "Matrix Sheet Successfully Imported!";
                        }

                      }
                      elseif ($params['type_of_sheet']=="Height") 
                      {
                       if ($sheetData[1][A]!="Infratel ID"||$sheetData[1][B]!="Lat"||$sheetData[1][C]!="Long") 
                       {
                        $this->view->errorMessage = "This is not a valid Excel Sheet.Please Upload Valid Excel Sheet";
                      }
                      else{
                             //echo "data sheet  valid";exit;
                        $i=1;
                        foreach($sheetData as $rec)
                              //echo $rec['A'];exit;
                        {
                         if($i!=1){
                          $query1 = "select * from tbl_location_mapping where infratel_site_id ='".trim($rec['A'])."' ";
                          $deployment_list1 = $this->dbAdapter->fetchRow($query1);
                          if ($deployment_list1['infratel_site_id']==trim($rec['A'])) 
                          { 
                     //          			echo  "data is duplicate here"; 
                     //          			echo "<pre>";
          							    // print_r($deployment_list1);
                          }

                          else{
                           $masterDataArray = array();
                           $masterDataArray['infratel_site_id']     = trim($rec['A']);
                           $masterDataArray['latitude']             = trim($rec['B']);
                           $masterDataArray['longitude']            = trim($rec['C']);
                           $masterDataArray['importation_datetime'] = date("Y-m-d H:i:s");  
	                              //echo "data inserted";

                           $this->db->insert('tbl_location_mapping', $masterDataArray);
                              //$this->_redirect('/siteallocation/index'); 
                         }


                       }
                       $i++;
                          }//exit;
                          $this->view->messages = "Height & Dump Sheet Successfully Imported!";
                        }

                      }
                      else{
                       $this->view->errorMessage = "Please Select the Type of Excel Sheet";
                     }
                   }

                 }
               }
             }
           }
         }

         public function deploymentListAction()
         {
           $this->checklogin();
           $params                = $this->view->params = $this->getRequest()->getParams(); 
           $this->view->totalnum   = $params['page'];

           if($params['po']){
            $cond .="and po like '%".$params['po']."%' ";  
          }
          if($params['site_id']){
            $cond .="and technical_site_id = '".$params['site_id']."' ";  
          }



         ///query for get deployment data
          $query = "select * from tbl_deployment where 1 $cond order by id asc";
          $this->view->deployment_list = $deployment_list = $this->dbAdapter->fetchAll($query);

          $page=$this->_getParam('page',1);
          $paginator = Zend_Paginator::factory($deployment_list);      
          $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
          $paginator->setItemCountPerPage(10); // number of items to show per page
          $this->view->paginator = $paginator;
          $this->view->perPage = 10;
          $this->view->totalrec = $paginator->getTotalItemCount();  
          $this->_helper->layout()->disableLayout(); 
        }

        public function matrixsListAction()
        {
         $this->checklogin(); 
         $params                = $this->view->params = $this->getRequest()->getParams(); 
         $this->view->totalnum   = $params['page'];
         ///query for get matrix data
         $query_matrix = "select * from tbl_matrix where 1 order by id asc";
         $this->view->matrix_list = $matrix_list = $this->dbAdapter->fetchAll($query_matrix);

         $page=$this->_getParam('page',1);
         $paginator = Zend_Paginator::factory($matrix_list);      
          $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
          $paginator->setItemCountPerPage(10); // number of items to show per page
          $this->view->paginator_matrix = $paginator;
          $this->view->perPage = 10;
          $this->view->totalrec_matrix = $paginator->getTotalItemCount();   
          $this->_helper->layout()->disableLayout(); 
        }

        public function locationListAction()
        {
         $this->checklogin(); 
         $params                = $this->view->params = $this->getRequest()->getParams(); 
         $this->view->totalnum   = $params['page'];
         ///query for get matrix data
         $query_location = "select * from tbl_location_mapping where 1 order by id asc";
         $this->view->location_list = $location_list = $this->dbAdapter->fetchAll($query_location);

         $page=$this->_getParam('page',1);
         $paginator = Zend_Paginator::factory($location_list);      
          $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
          $paginator->setItemCountPerPage(10); // number of items to show per page
          $this->view->paginator_location = $paginator;
          $this->view->perPage = 10;
          $this->view->totalrec_location = $paginator->getTotalItemCount();  
          $this->_helper->layout()->disableLayout(); 
        }



        public function addDeployementAction()
        {
         $this->checklogin(); 
         $this->view->messages  = $this->_flashMessenger->getMessages();
         $params  = $this->view->params = $this->getRequest()->getParams(); 
        /* $query = "select * from tbl_deployment where id = '".$params['id']."' ";
        $this->view->deployment_data = $deployment_data = $this->dbAdapter->fetchRow($query);*/
        $sql_nature_of_work = "select * from tbl_nature_of_work where 1 order by nature_of_work asc ";
        $this->view->nature_of_work = $nature_of_work = $this->dbAdapter->fetchAll($sql_nature_of_work);
        if($this->getRequest()->isPost()) 
        {
        	$query1 = "select * from tbl_deployment where so ='".trim($params['SO'])."' and  opco_name ='".trim($params['opco_name'])."' and po ='".trim($params['po'])."' and technical_site_id ='".trim($params['technical_site_id'])."'  and item_des ='".trim($params['item_des'])."' AND NOT (id = '".$params['d_id']."') ";

        	$deployment_list1 = $this->dbAdapter->fetchRow($query1);
            //print_r($deployment_list);

        	if($deployment_list1['so']==trim($params['SO']) && $deployment_list1['opco_name']==trim($params['opco_name']) && $deployment_list1['po']==trim($params['po']) && $deployment_list1['technical_site_id']==trim($params['technical_site_id'])   && $deployment_list1['item_des']==trim($params['item_des'])) 
        	{

        		$this->view->errorMessage = "This data is already Exist";
        	}
        	elseif($params['SO'] == ''){
        		$this->view->errorMessage = "Please Enter SO.";
        	}
        	elseif($params['opco_name'] == ''){
        		$this->view->errorMessage = "Please Opco Name.";
        	}
        	elseif($params['sr_type_opco'] == ''){
        		$this->view->errorMessage = "Please Enter SR Type Opco.";
        	}
        	elseif($params['po'] == ''){
        		$this->view->errorMessage = "Please Enter Po.";
        	}
        	elseif($params['infratel_id'] == ''){
        		$this->view->errorMessage = "Please Enter Infratel Id.";
        	}
        	elseif($params['district'] == ''){
        		$this->view->errorMessage = "Please Enter District.";
        	}
        	elseif($params['zone'] == ''){
        		$this->view->errorMessage = "Please Enter Zone.";
        	}
        	elseif($params['cluster'] == ''){
        		$this->view->errorMessage = "Please Enter Cluster.";
        	}
        	elseif($params['technical_site_id'] == ''){
        		$this->view->errorMessage = "Please Enter Technical Site Id.";
        	}
        	elseif($params['item'] == ''){
        		$this->view->errorMessage = "Please Enter Item.";
        	}
        	elseif($params['category'] == ''){
        		$this->view->errorMessage = "Please Enter Category.";
        	}
        	elseif($params['item_des'] == ''){
        		$this->view->errorMessage = "Please Enter Item Desciption.";
        	}else{
                //        echo "<pre>";
                // print_r($params);
                // echo "</pre>";exit;
        		$roleData  = array();
        		$roleData['so']                 = $params['SO'];
        		$roleData['opco_name']          = $params['opco_name'];
        		$roleData['sr_type_opco']       = $params['sr_type_opco'];
        		$roleData['po']                 = $params['po'];
        		$roleData['infratel_id']        = $params['infratel_id'];
        		$roleData['district']           = $params['district'];
        		$roleData['zone']               = $params['zone'];
        		$roleData['cluster']            = $params['cluster'];
        		$roleData['technical_site_id']  = $params['technical_site_id'];
        		$roleData['item']               = $params['item'];
        		$roleData['category']           = $params['category'];
        		$roleData['item_des']           = $params['item_des'];
        		$roleData['created_date']       = date('d-M-y');
                // $roleData['created']            = date('Y-m-d H:i:s');
                // echo "<pre>";
                // print_r($params);
                // echo "</pre>";exit;


        		$this->dbAdapter->insert('tbl_deployment', $roleData);

               // $this->dbAdapter->insert('tbl_vendor', $roleData);
                //echo "data updated";exit;

        		$this->view->getMessages = ('Deployement data has been successfully Added!');
             //$this->view->messages = "";
              //$this->_redirect('/import');
        	}
        }

      }
      public function editDeployementAction()
      {
       $this->checklogin(); 
       $this->view->messages  = $this->_flashMessenger->getMessages();
       $this->view->params = $params  =  $this->getRequest()->getParams(); 
       $query = "select * from tbl_deployment where id = '".$params['id']."' ";
       $this->view->deployment_data = $deployment_data = $this->dbAdapter->fetchRow($query);
       if($this->getRequest()->isPost()) 
       {
        $query1 = "select * from tbl_deployment where so ='".trim($params['SO'])."' and  opco_name ='".trim($params['opco_name'])."' and po ='".trim($params['po'])."' and technical_site_id ='".trim($params['technical_site_id'])."'  and item_des ='".trim($params['item_des'])."' AND NOT (id = '".$params['d_id']."') ";

        $deployment_list1 = $this->dbAdapter->fetchRow($query1);

        if ($deployment_list1['so']==trim($params['SO']) && $deployment_list1['opco_name']==trim($params['opco_name']) && $deployment_list1['po']==trim($params['po']) && $deployment_list1['technical_site_id']==trim($params['technical_site_id'])   && $deployment_list1['item_des']==trim($params['item_des'])) 
        {
         $this->view->errorMessage = "This data is already Exist";
       }
            /*elseif($params['SO'] == ''){
                $this->view->errorMessage = "Please Enter SO.";
            }
            elseif($params['opco_name'] == ''){
                $this->view->errorMessage = "Please Opco Name.";
            }
            elseif($params['sr_type_opco'] == ''){
                $this->view->errorMessage = "Please Enter SR Type Opco.";
            }
            elseif($params['po'] == ''){
                $this->view->errorMessage = "Please Enter Po.";
              }*/
              elseif($params['infratel_id'] == ''){
               $this->view->errorMessage = "Please Enter Infratel Id.";
             }
            /*elseif($params['district'] == ''){
                $this->view->errorMessage = "Please Enter District.";
            }
            elseif($params['zone'] == ''){
                $this->view->errorMessage = "Please Enter Zone.";
            }
            elseif($params['cluster'] == ''){
                $this->view->errorMessage = "Please Enter Cluster.";
              }*/
              elseif($params['technical_site_id'] == ''){
               $this->view->errorMessage = "Please Enter Technical Site Id.";
             }
            /*elseif($params['item'] == ''){
                $this->view->errorMessage = "Please Enter Item.";
            }
            elseif($params['category'] == ''){
                $this->view->errorMessage = "Please Enter Category.";
            }
            elseif($params['item_des'] == ''){
                $this->view->errorMessage = "Please Enter Item Desciption.";
              }*/else{
                // echo "<pre>";
                // print_r($params);
                // echo "</pre>";exit;
               $roleData  = array();
               $roleData['so']                 = $params['SO'];
               $roleData['opco_name']          = $params['opco_name'];
               $roleData['sr_type_opco']       = $params['sr_type_opco'];
               $roleData['po']                 = $params['po'];
               $roleData['infratel_id']        = $params['infratel_id'];
               $roleData['district']           = $params['district'];
               $roleData['zone']               = $params['zone'];
               $roleData['cluster']            = $params['cluster'];
               $roleData['technical_site_id']  = $params['technical_site_id'];
               $roleData['item']               = $params['item'];
               $roleData['category']           = $params['category'];
               $roleData['item_des']           = $params['item_des'];
               $roleData['created_date']       = date('d-M-y');
                // $roleData['created']            = date('Y-m-d H:i:s');
                // echo "<pre>";
                // print_r($params);
                // echo "</pre>";exit;


               $where = array();
               $where[] = $this->dbAdapter->quoteInto('id = ?', $params['d_id']);
               $this->dbAdapter->update('tbl_deployment', $roleData,$where);
               // $this->dbAdapter->insert('tbl_vendor', $roleData);
                //echo "data updated";exit;

               $this->view->messages = ('Deployement data has been successfully Updated!');
             //$this->view->messages = "";
               $this->_redirect('/import/edit-deployement/id/'.$params["d_id"].'');





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







