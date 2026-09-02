<?php
class Application_Model_Api extends Zend_Db_Table_Abstract
{   

  /**
  * getUserDetailByEmail() method is used to get all the users
  * @param Array
  * @return True 
  * add by kriti singh
  */
  public function getUserDetailByContactNo($contact_no){
   $db = Zend_Db_Table::getDefaultAdapter();
   $sql = "SELECT * FROM tbl_user WHERE contact_no ='".$contact_no."'"; 
   return  $db->fetchRow($sql);
 }


    /**
  * getUserDetailByAccessToken() method is used to get user data
  * @param Array
  * @return True 
  * by kriti singh
  */
    public function getUserDetailByAccessToken($accessToken){
     $db = Zend_Db_Table::getDefaultAdapter();
     $sql = "SELECT * FROM tbl_user WHERE access_token ='".$accessToken."'";
     return  $db->fetchRow($sql);
   } 

    /**
  * getUserList() method is used to get all the user list
  * @param Array
  * @return True 
  * add by kriti singh
  */
    public function getUserList($userId){
     $db = Zend_Db_Table::getDefaultAdapter();
     $sql = "SELECT  FROM tbl_user  WHERE email_id !='".$userId."' order by id desc";
     return  $db->fetchAll($sql);
   }


   public function getUserDetails($contact_no){
     $db = Zend_Db_Table::getDefaultAdapter();

     $sql = "select id, name, email_id, password, contact_no, department, role_type, role,date_of_birth,permanent_address,current_address,date_of_joining, access_token from tbl_user where contact_no ='".$contact_no."'";
     $result =  $db->fetchRow($sql);

     $sql_distance = "select distance from tbl_global_data";
     $result_nature = $db->fetchRow($sql_distance);

     $user_details =array('id' =>$result['id'],'access_token' =>$result['access_token'], 'name' =>$result['name'],'email_id' =>$result['email_id'],'password' =>$result['password'],'contact_no' =>$result['contact_no'],'department' =>$result['department'],'role_type' =>$result['role_type'],'role' =>$result['role'],'date_of_birth' =>$result['date_of_birth'],'permanent_address' =>$result['permanent_address'],'current_address' =>$result['current_address'],'date_of_joining' =>$result['date_of_joining'],'distance' =>$result_nature['distance'],'user_type' =>"staff" );

     return $user_details;
   }





   public function getVendorDetailByContactNo($contact_no){
     $db = Zend_Db_Table::getDefaultAdapter();
     $sql = "SELECT * FROM tbl_vendor WHERE contact_number ='".$contact_no."'"; 
     return  $db->fetchRow($sql);
   }

      /**
    * getUserDetailByAccessToken() method is used to get user data
    * @param Array
    * @return True 
    * by kriti singh
    */
      public function getVendorDetailByAccessToken($accessToken){
       $db = Zend_Db_Table::getDefaultAdapter();
       $sql = "SELECT * FROM tbl_vendor WHERE access_token ='".$accessToken."'";
       return  $db->fetchRow($sql);
     } 



     public function getVendorDetails($contact_no){
       $db = Zend_Db_Table::getDefaultAdapter();

       $sql = "select id, vendor_name as name, email as email_id, contact_number as contact_no,address, access_token from tbl_vendor where contact_number ='".$contact_no."'";
       $result =  $db->fetchRow($sql);

       $sql_distance = "select distance from tbl_global_data";
       $result_nature = $db->fetchRow($sql_distance);

       $vendor_details =array('id' =>$result['id'],'access_token' =>$result['access_token'], 'name' =>$result['name'],'email_id' =>$result['email_id'],'contact_no' =>$result['contact_no'],'address' =>$result['address'],'distance'=>$result_nature['distance'], 'user_type' =>"vendor");

       return $vendor_details;
     }

     /**
    * checkUserDayStart() method is used to get all the user list
    * @param Array
    * @return True 
    * add by kriti singh
    */

     public function checkUserDayStart($contact_no,$date_convert){
       $db = Zend_Db_Table::getDefaultAdapter();
       $sql = "SELECT *  FROM tbl_staff_attendance where contact_no='".$contact_no."'  and DATE(start_day_datetime)='".$date_convert."'";
       $result =  $db->fetchRow($sql);
        // echo "<pre>";
        //  print_r($result);
        // echo "</pre>";exit;
       return $result;
     }

      /**
    * checkUserDayStart() method is used to get all the user list
    * @param Array
    * @return True 
    * add by kriti singh
    */

      public function checkVendorDayStart($contact_no,$date_convert){
       $db = Zend_Db_Table::getDefaultAdapter();
       $sql = "SELECT *  FROM tbl_staff_attendance where contact_no ='".$contact_no."'  and DATE(start_day_datetime)='".$date_convert."'";  
       $result =  $db->fetchRow($sql);
        // echo "<pre>";
        //  print_r($result);
        // echo "</pre>";exit;
       return $result;
     }


    /**
  * getSiteAllocationList() method is used to get all site
  * @param Array
  * @return True 
  * add by kriti singh
  */
    public function getSiteAllocationList($id){
     $db = Zend_Db_Table::getDefaultAdapter();
     $sql = "select id as site_allocation_id, po_no as po_number, site_id, zone,cluster, latitude,longitude, tech_name,tech_mobile,item_desc,status from tbl_site_allocation where allocated_to_userid ='".$id."'";

     return $db->fetchAll($sql);    
   }


   public function getSiteAllocationListByVendor($id){
     $db = Zend_Db_Table::getDefaultAdapter();
     $sql = "select id as site_allocation_id, po_no as po_number, site_id, zone,cluster, latitude,longitude, tech_name,tech_mobile,item_desc,status from tbl_site_allocation where allocated_to_userid ='".$id."'"; 

     return $db->fetchAll($sql);    
   }
   /**
  * getSiteAllocationDetails() method is used to get site allocation details
  * @param Array
  * @return True 
  * add by kriti singh
  */
   public function getSiteAllocationDetails($id, $site_allocation_id){
     $db = Zend_Db_Table::getDefaultAdapter();
     $sql = "select id as site_allocation_id , po_no as po_number, site_id, zone, cluster, tech_name, tech_mobile, cluster_incharge, cluster_mobile, DATE_FORMAT(created,'%d/%m/%Y') as created, DATE_FORMAT(due_date,'%d/%m/%Y') as due_date  from tbl_site_allocation where id ='".$site_allocation_id."' "; 
     $result =  $db->fetchRow($sql);

     $sql_nature = "SELECT ts . * , tn.nature_of_work AS nature_of_works FROM tbl_site_nature_of_work AS ts LEFT JOIN tbl_nature_of_work AS tn ON ( ts.nature_of_work_id = tn.id ) WHERE site_allocation_id ='".$site_allocation_id."'";
     $result_nature = $db->fetchAll($sql_nature);

     $site_allocation = array('site_allocation_id'=>$result['site_allocation_id'], 'site_id'=>$result['site_id'], 'zone'=>$result['zone'], 'cluster'=>$result['cluster'], 'cluster_mobile'=>$result['cluster_mobile'],'tech_name'=>$result['tech_name'], 'tech_mobile'=>$result['tech_mobile'], 
      'cluster_incharge'=>$result['cluster_incharge'], 'created'=>$result['created'], 'due_date'=>$result['due_date'], 'nature_of_work'=>$result_nature);
     return $site_allocation;


   }

   public function getSiteAllocationDetailsByVendor($id, $site_allocation_id){
     $db = Zend_Db_Table::getDefaultAdapter();
     $sql = "select id as site_allocation_id , site_id, zone, cluster, tech_name, tech_mobile, cluster_incharge, cluster_mobile, DATE_FORMAT(created,'%d/%m/%Y') as created, DATE_FORMAT(due_date,'%d/%m/%Y') as due_date  from tbl_site_allocation where id ='".$site_allocation_id."' "; 
     $result =  $db->fetchRow($sql);

     $sql_nature = "SELECT ts . * , tn.nature_of_work AS nature_of_works FROM tbl_site_nature_of_work AS ts LEFT JOIN tbl_nature_of_work AS tn ON ( ts.nature_of_work_id = tn.id ) WHERE site_allocation_id ='".$site_allocation_id."'";
     $result_nature = $db->fetchAll($sql_nature);

     $site_allocation = array('site_allocation_id'=>$result['site_allocation_id'], 'site_id'=>$result['site_id'], 'zone'=>$result['zone'], 'cluster'=>$result['cluster'], 'cluster_mobile'=>$result['cluster_mobile'],'tech_name'=>$result['tech_name'], 'tech_mobile'=>$result['tech_mobile'], 
      'cluster_incharge'=>$result['cluster_incharge'], 'created'=>$result['created'], 'due_date'=>$result['due_date'], 'nature_of_work'=>$result_nature);
     return $site_allocation;


   }

   public function getSiteAllocationData($site_allocation_id){

    $db = Zend_Db_Table::getDefaultAdapter();
    $sql = "select * from tbl_site_nature_of_work where site_allocation_id ='".$site_allocation_id."'"; 
    return $result = $db->fetchRow($sql);
  }

     /**
  * getSiteAllocationDetails() method is used to get site allocation details
  * @param Array
  * @return True 
  * add by kriti singh
  */
     public function getCompletedTaskByStatus($site_allocation_id){
       $db = Zend_Db_Table::getDefaultAdapter();
       $sql = "select id as site_allocation_id , site_id, zone, cluster, tech_name, tech_mobile, cluster_incharge, cluster_mobile,status, DATE_FORMAT(created,'%d/%m/%Y') as created, DATE_FORMAT(due_date,'%d/%m/%Y') as due_date  from tbl_site_allocation where id ='".$site_allocation_id."' "; 
       $result =  $db->fetchRow($sql);

       $sql_nature = "SELECT ts . * ,tn.nature_of_work AS nature_of_works FROM tbl_site_nature_of_work AS ts LEFT JOIN tbl_nature_of_work AS tn ON ( ts.nature_of_work_id = tn.id ) WHERE site_allocation_id ='".$site_allocation_id."'"; 
       $result_nature = $db->fetchAll($sql_nature);

        // $sql_image = "select * from tbl_site_image where site_allocation_id ='".$site_allocation_id."' and  status = '1'";
        //   $result_image = $db->fetchRow($sql_image);


       $site_allocation = array('site_allocation_id'=>$result['site_allocation_id'], 'site_id'=>$result['site_id'], 'zone'=>$result['zone'],'status'=>$result['status'], 'cluster'=>$result['cluster'], 'cluster_mobile'=>$result['cluster_mobile'],'tech_name'=>$result['tech_name'], 'tech_mobile'=>$result['tech_mobile'], 
        'cluster_incharge'=>$result['cluster_incharge'], 'created'=>$result['created'], 'due_date'=>$result['due_date'], 'nature_of_work'=>$result_nature);
       return $site_allocation;


     }

     public function checkSiteAllocatedStatus($site_allocation_id){
       $db = Zend_Db_Table::getDefaultAdapter();
       $sql = "select status from tbl_site_nature_of_work where site_allocation_id = '".$site_allocation_id."'";    
       $result = $db->fetchAll($sql);

       $site = array();
       foreach ($result as $key => $value) {
        array_push($site, $value['status']);
      }

      if(!array_search('0', $site)){ return '1'; }else{ return '0'; }   
    }





    /*-----------------------for mobile application end-------------------------------------------*/

    public function getAllPONO(){
      $db = Zend_Db_Table::getDefaultAdapter();
      $sql = "SELECT po_no ,description FROM tbl_expense_report";
      $result = $db->fetchAll($sql);
      return $result;
    }

    public function getTransferTo(){
      $db = Zend_Db_Table::getDefaultAdapter();
      $sql = "SELECT id , name ,account_number FROM tbl_user WHERE status='1' ";
      return  $db->fetchAll($sql);
    }

    public function getTransferFor(){
      $db = Zend_Db_Table::getDefaultAdapter();
      $sql = "SELECT * FROM tbl_transfer_for WHERE type='Site Expenses' AND status='1' ";
      return  $db->fetchAll($sql);
    }

    public function getTransferForTwo(){
      $db = Zend_Db_Table::getDefaultAdapter();
      $sql = "SELECT * FROM tbl_transfer_for WHERE type='Office Expenses' AND status='1' ";
      return  $db->fetchAll($sql);
    }

    public function getStateFor(){
      $db = Zend_Db_Table::getDefaultAdapter();
      $sql = "SELECT * FROM tbl_state_for WHERE status='1' ";
      return  $db->fetchAll($sql);
    }






  }
  ?>