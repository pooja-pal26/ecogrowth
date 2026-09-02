<?php
class Application_Model_User extends Zend_Db_Table_Abstract
{   
    /**
    * getUserList() method is used to get all the users
    * @param Array
    * @return True 
    * add by Sanjay 
    */

    public function getIndianCurrency($number)
    {
      $decimal = round($number - ($no = floor($number)), 2) * 100;
      $hundred = null;
      $digits_length = strlen($no);
      $i = 0;
      $str = array();
      $words = array(0 => '', 1 => 'one', 2 => 'two',
        3 => 'three', 4 => 'four', 5 => 'five', 6 => 'six',
        7 => 'seven', 8 => 'eight', 9 => 'nine',
        10 => 'ten', 11 => 'eleven', 12 => 'twelve',
        13 => 'thirteen', 14 => 'fourteen', 15 => 'fifteen',
        16 => 'sixteen', 17 => 'seventeen', 18 => 'eighteen',
        19 => 'nineteen', 20 => 'twenty', 30 => 'thirty',
        40 => 'forty', 50 => 'fifty', 60 => 'sixty',
        70 => 'seventy', 80 => 'eighty', 90 => 'ninety');
      $digits = array('', 'hundred','thousand','lakh', 'crore');
      while( $i < $digits_length ) {
        $divider = ($i == 2) ? 10 : 100;
        $number = floor($no % $divider);
        $no = floor($no / $divider);
        $i += $divider == 10 ? 1 : 2;
        if ($number) {
          $plural = (($counter = count($str)) && $number > 9) ? 's' : null;
          $hundred = ($counter == 1 && $str[0]) ? ' and ' : null;
          $str [] = ($number < 21) ? $words[$number].' '. $digits[$counter]. $plural.' '.$hundred:$words[floor($number / 10) * 10].' '.$words[$number % 10]. ' '.$digits[$counter].$plural.' '.$hundred;
        } else $str[] = null;
      }
      $Rupees = implode('', array_reverse($str));
      $paise = ($decimal) ? "." . ($words[$decimal / 10] . " " . $words[$decimal % 10]) . ' Paise' : '';
      return ($Rupees ? $Rupees . 'Rupees ' : '') . $paise;
    }
    
    public function getUserList(){ 
      $db =  Zend_Db_Table::getDefaultAdapter();
      $query="select tu.*,trt.role_type, tr.role,td.department from tbl_user as tu  left join tbl_roles as tr  on (tr.id = tu.role) left join tbl_role_type as trt  on (trt.id = tu.role_type) left join cairn_department as td  on (td.id = tu.department)  where tu.status = 1 and tu.is_deleted = 0  order by name";

      $result = $db->fetchAll($query);
      return $result;
    }

    public function getTaskMontlyRecord($date)
    {
      $db = Zend_Db_Table::getDefaultAdapter();        
      $taskArray = array();
      $i=0;
      for($j=1;$j<=12;$j++){
        if($j<10){ $j= '0'.$j;}
        $dateoftask = date('Y-'.$j.'-01');
        $query = "select count(id) as pending  from tbl_site_allocation where MONTH(created) = MONTH('".$dateoftask."') and status=0 ";
        $result = $db->fetchRow($query);

        $query_complete = "select count(id) as complete  from tbl_site_allocation where MONTH(created) = MONTH('".$dateoftask."') and status=1 ";
        $result_complete = $db->fetchRow($query_complete);

        $task = array('pending'=>$result['pending'], 'complete'=>$result_complete['complete']);
        array_push($taskArray, $task);            
        $i++;}        
        return $taskArray;
      }

      public function getUserInfoByUserId($id){ 
        try{
          $db =  Zend_Db_Table::getDefaultAdapter();
          $query="SELECT id, first_name, last_name, email_id, contact_no, alternate_mobile, department, role_type, role, date_of_joining, profile_path, permanent_address, current_address, finger_iso_1, finger_iso_2, finger_iso_3, finger_iso_4, finger_iso_5 FROM tbl_user WHERE status = 1 AND md5(id) = '".$id."'";
          $result = $db->fetchRow($query);
          return $result;
        } catch(Exception $e){
          echo $e->getMessage();exit;
        }
      }

      public function getsite_allcate_data(){
        //echo $v_id;exit;
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "select  s.*, u.name as allocate_user, sup.name as supervisor, v.vendor_name as vendor  from  tbl_site_allocation as s 
        left join tbl_user as u on (s.allocate_userid = u.id)
        left join tbl_user as sup on (s.supervisor_id = sup.id)
        left join tbl_vendor as v on (s.allocate_userid = v.id)
        where 1 order by s.id DESC";
        $result =  $db->fetchAll($sql);        
        return $result;
      }
      public function getsite_allcate_data_row($allocation_id){
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "select  s.*, u.name as allocate_user, sup.name as supervisor, v.vendor_name as vendor, st.name as status_name  from  tbl_site_allocation as s 
        left join tbl_user as u on (s.allocate_userid = u.id)
        left join tbl_user as sup on (s.supervisor_id = sup.id)
        left join tbl_vendor as v on (s.allocate_userid = v.id)
        left join tbl_site_status as st on (s.status = st.status)
        where md5(s.id) = '".$allocation_id."' ";
        $result =  $db->fetchRow($sql);
        return $result;
      }

      public function get_nature_work_data($allocation_id){ 
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql="select tbl_n.*,master_n.nature_of_work  from tbl_site_nature_of_work as tbl_n  left join tbl_nature_of_work as master_n  on (tbl_n.nature_of_work_id = master_n.id)  WHERE md5(tbl_n.site_allocation_id) = '".$allocation_id."' order by id DESC";
        $result =  $db->fetchAll($sql);
        return $result;
      }

      public function getAllUserIdAndName(){ 
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "SELECT id, name FROM tbl_user WHERE status=1 ";
        $result =  $db->fetchAll($sql);
        return $result;
      }

      public function getusermobile($mobile){ 
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "SELECT contact_no FROM tbl_user WHERE  status=1 and contact_no = '".$mobile."'";
        $result =  $db->fetchAll($sql);
        return $result;
      }

      public function getuseremail($email){         
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "SELECT email_id FROM tbl_user WHERE  status='1' and email_id = '".$email."'";
        $result =  $db->fetchAll($sql);
        return $result;
      }
      public function getvendormobile($mobile){ 
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "SELECT mobile FROM tbl_vendor WHERE  status=1 and mobile = '".$mobile."'";
        $result =  $db->fetchAll($sql);
        return $result;
      }
      public function getvendoremail($email){         
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "SELECT email FROM tbl_vendor WHERE  status=1 and email = '".$email."'";
        $result =  $db->fetchAll($sql);
        return $result;
      }
      public function getVendorManpowerListbyid($m_id){ 
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "SELECT * FROM tbl_vendor_manpower WHERE status=1 AND id = '".$m_id."' ";
        $result =  $db->fetchRow($sql);
        return $result;
      }
      public function getVendorListbyid($v_id){ 
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "SELECT * FROM tbl_vendor WHERE status=1 AND id = '".$v_id."' ";
        $result =  $db->fetchRow($sql);
        return $result;
      }  

      public function getUserNameByID($userId){
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "SELECT id,name FROM tbl_user WHERE id ='".$userId."'";
        return  $db->fetchRow($sql);
      }

      public function getDepartment(){
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "SELECT * FROM cairn_department WHERE status=1 ";
        $result =  $db->fetchAll($sql);
        return $result;
      }

      public function getRoletype(){
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "SELECT * FROM tbl_role_type WHERE status=1 ";
        $result =  $db->fetchAll($sql);
        return $result;
      }

      public function getRoleByRoleType($role_type_id){
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "SELECT * FROM tbl_roles WHERE role_type='".$role_type_id."' ";
        $result =  $db->fetchAll($sql);
        return $result;
      }

      public function getallvendorsDetails(){
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql="select * from tbl_vendor WHERE status = 1 order by id DESC";
        $result =  $db->fetchAll($sql);
        //  echo "<pre>";
        // print_r($result); exit;
        return $result;
      }

      public function getallvendorsManpower($v_id){
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "select t_manpower.*,td.department as dname  FROM tbl_vendor_manpower as t_manpower left join cairn_department as td  on (td.id = t_manpower.department) WHERE t_manpower.status = 1 and vendor_id ='".$v_id."' ";
        $result =  $db->fetchAll($sql);
        return $result;
      }

      public function getallsiteAllocation(){
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "SELECT * FROM tbl_siteallocation WHERE status=1";
        $result =  $db->fetchAll($sql);
        return $result;
      }

      public function getallmatrixdata(){
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "SELECT * FROM tbl_matrix WHERE status=1";
        $result =  $db->fetchAll($sql);
        return $result;
      }

      public function getallheightdata(){
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "SELECT * FROM tbl_height WHERE status=1";
        $result =  $db->fetchAll($sql);
        return $result;
      }

    //   public function getTotalSite($year,$month,$site_type){
    //       echo $year.'-'.$month;
    //     $db = Zend_Db_Table::getDefaultAdapter();
    //     if(!empty($site_type) && empty($year) && empty($month) ){
    //         $sql = "SELECT COUNT(*)  as totalsite FROM tbl_po_sites as ps left join tbl_po_details as pd on(ps.po_no=pd.po_no) where ps.is_deleted =0 and pd.site_type ='".$site_type."' ";
    //     }elseif(!empty($site_type) && !empty($year) && !empty($month)){
    //         $sql = "SELECT COUNT(*)  as totalsite FROM tbl_po_sites as ps left join tbl_po_details as pd on(ps.po_no=pd.po_no) where ps.is_deleted =0 and pd.site_type ='".$site_type."' and pd.order_date like '%".$year.'-'.$month."%'";
    //     }elseif(empty($site_type) && !empty($year) && !empty($month)){
    //         $sql = "SELECT COUNT(*)  as totalsite FROM tbl_po_sites as ps left join tbl_po_details as pd on(ps.po_no=pd.po_no) where ps.is_deleted =0 and pd.order_date like '%".$year.'-'.$month."%'";
    //     }elseif(empty($site_type) && !empty($year) && empty($month)){
    //         $sql = "SELECT COUNT(*)  as totalsite FROM tbl_po_sites as ps left join tbl_po_details as pd on(ps.po_no=pd.po_no) where ps.is_deleted =0 and pd.order_date like '%".$year."%'";
    //     }elseif(!empty($site_type) && !empty($year) && empty($month)){
    //         $sql = "SELECT COUNT(*)  as totalsite FROM tbl_po_sites as ps left join tbl_po_details as pd on(ps.po_no=pd.po_no) where ps.is_deleted =0 and pd.site_type ='".$site_type."' and pd.order_date like '%".$year."%'";
    //     }elseif(empty($site_type) && empty($year) && empty($month)){
    //          $sql = "SELECT COUNT(*)  as totalsite FROM tbl_po_sites where is_deleted =0 ";
    //     }else{
    //         $sql = "SELECT COUNT(*)  as totalsite FROM tbl_po_sites where is_deleted =0 ";
    //     }
    //     $result = $db->fetchRow($sql);
    //     return $result;

    //   }
      
      public function getTotalSite($from_date,$to_date,$site_type){
        //   echo $from_date;
        //   exit;
        $db = Zend_Db_Table::getDefaultAdapter();
        if(!empty($site_type) && empty($from_date) && empty($to_date) ){
            $sql = "SELECT COUNT(*)  as totalsite FROM tbl_po_sites as ps left join tbl_po_details as pd on(ps.po_no=pd.po_no) where ps.is_deleted =0 and pd.site_type ='".$site_type."' ";
        }elseif(!empty($site_type) && !empty($from_date) && !empty($to_date)){
            $sql = "SELECT COUNT(*)  as totalsite FROM tbl_po_sites as ps left join tbl_po_details as pd on(ps.po_no=pd.po_no) where ps.is_deleted =0 and pd.site_type ='".$site_type."' and (pd.order_date >= '".$from_date."') and (pd.order_date <= '".$to_date."')";
        }elseif(empty($site_type) && !empty($from_date) && !empty($to_date)){
            $sql = "SELECT COUNT(*)  as totalsite FROM tbl_po_sites as ps left join tbl_po_details as pd on(ps.po_no=pd.po_no) where ps.is_deleted =0 and (pd.order_date >= '".$from_date."') and (pd.order_date <= '".$to_date."')";
       }elseif(empty($site_type) && empty($from_date) && empty($to_date)){
             $sql = "SELECT COUNT(*)  as totalsite FROM tbl_po_sites where is_deleted =0 ";
        }else{
            $sql = "SELECT COUNT(*)  as totalsite FROM tbl_po_sites where is_deleted =0 ";
        }
        // echo $sql;
        // exit;
        $result = $db->fetchRow($sql);
        return $result;
      }
    //   public function getTotalSitee($site_type){
    //     $db = Zend_Db_Table::getDefaultAdapter();
    //     // $sql = "SELECT COUNT(*)  as totalsite FROM tbl_po_sites where is_deleted =0 ";
        
    //     $sql = "SELECT COUNT(*)  as totalsite FROM tbl_po_sites as ps left join tbl_po_details as pd on(ps.po_no=pd.po_no) where ps.is_deleted =0 and pd.site_type ='".$site_type."' ";
    //     $result = $db->fetchRow($sql);
    //     return $result;

    //   }

      public function getTotalAllocatedSite($from_date,$to_date,$site_type){
        $db = Zend_Db_Table::getDefaultAdapter();
        if(!empty($site_type) && empty($from_date) && empty($to_date) ){
            $sql = "SELECT COUNT(*)  as allocatedsite FROM tbl_site_allocation as tsa left join tbl_po_details as pd on(tsa.po_no=pd.po_no) where tsa.status =1 and pd.site_type ='".$site_type."' ";
        }elseif(!empty($site_type) && !empty($from_date) && !empty($to_date)){
            $sql = "SELECT COUNT(*)  as allocatedsite FROM tbl_site_allocation as tsa left join tbl_po_details as pd on(tsa.po_no=pd.po_no) where tsa.status =1 and pd.site_type ='".$site_type."' and (pd.order_date >= '".$from_date."') and (pd.order_date <= '".$to_date."')";
        }elseif(empty($site_type) && !empty($from_date) && !empty($to_date)){
            $sql = "SELECT COUNT(*)  as allocatedsite FROM tbl_site_allocation as tsa left join tbl_po_details as pd on(tsa.po_no=pd.po_no) where tsa.status =1 and (pd.order_date >= '".$from_date."') and (pd.order_date <= '".$to_date."')";
       }elseif(empty($site_type) && empty($from_date) && empty($to_date)){
            $sql = "SELECT COUNT(*)  as allocatedsite FROM tbl_site_allocation";
        }else{
            $sql = "SELECT COUNT(*)  as allocatedsite FROM tbl_site_allocation";
        }
        $result = $db->fetchRow($sql);
        return $result;

      }

public function getpendingSite($from_date,$to_date,$site_type){
        $db = Zend_Db_Table::getDefaultAdapter();
        if(!empty($site_type) && empty($from_date) && empty($to_date) ){
            $sql = "SELECT COUNT(*)  as pendingsite FROM tbl_site_allocation as tsa left join tbl_po_details as pd on(tsa.po_no=pd.po_no) where tsa.site_completion_status =0 and tsa.status =1 and pd.site_type ='".$site_type."' ";
        }elseif(!empty($site_type) && !empty($from_date) && !empty($to_date)){
            $sql = "SELECT COUNT(*)  as pendingsite FROM tbl_site_allocation as tsa left join tbl_po_details as pd on(tsa.po_no=pd.po_no) where tsa.site_completion_status =0 and tsa.status =1 and pd.site_type ='".$site_type."' and (pd.order_date >= '".$from_date."') and (pd.order_date <= '".$to_date."')";
        }elseif(empty($site_type) && !empty($from_date) && !empty($to_date)){
            $sql = "SELECT COUNT(*)  as pendingsite FROM tbl_site_allocation as tsa left join tbl_po_details as pd on(tsa.po_no=pd.po_no) where tsa.site_completion_status =0 and tsa.status =1 and (pd.order_date >= '".$from_date."') and (pd.order_date <= '".$to_date."')";
       }elseif(empty($site_type) && empty($from_date) && empty($to_date)){
            $sql = "SELECT COUNT(*)  as pendingsite FROM tbl_site_allocation where site_completion_status =0 and status = 1";
        }else{
            $sql = "SELECT COUNT(*)  as pendingsite FROM tbl_site_allocation where site_completion_status =0 and status = 1";
        }
        // $sql = "SELECT COUNT(*)  as pendingsite FROM tbl_site_allocation where site_completion_status =0 and status = 1";
        $result = $db->fetchRow($sql);
        return $result;

      }

    //   public function getcompletedSite(){
    //     $db = Zend_Db_Table::getDefaultAdapter();
    //     $sql = "SELECT COUNT(*)  as completedsite FROM tbl_site_allocation where site_completion_status = 1 ";
    //     $result = $db->fetchRow($sql);
    //     return $result;

    //   } 
    
      public function getcompletedSite(){
        $db = Zend_Db_Table::getDefaultAdapter();
        $sql = "SELECT COUNT(*)  as completedsite FROM tbl_site_allocation where close_status = 1 ";
        $result = $db->fetchRow($sql);
        return $result;

      }

      public function getAttendanceRecord(){ 
        $db = Zend_Db_Table::getDefaultAdapter();
        $attendance = array();
        $sql_grp = "SELECT * FROM tbl_staff_attendance WHERE DATE(start_day_datetime) = CURDATE()  Group by user_id";
        $result_grp =  $db->fetchAll($sql_grp);

//left join tbl_user as tu  on (tv.assigned_user = tu.id)
        foreach ($result_grp as  $value)
        {
         if ($value['user_type']=="vendor") 
         {
                //echo "vendor";exit;
          $sql_asc = "SELECT tsa.* ,tu.vendor_name as user_name FROM tbl_staff_attendance as tsa left join tbl_vendor as tu on(tsa.user_id=tu.id) WHERE DATE(tsa.start_day_datetime) = CURDATE() and tsa.user_id = '".$value['user_id']."'  order by tsa.id asc";

          $result_asc =  $db->fetchRow($sql_asc);

          $sql_desc = "SELECT tsa.* ,tu.vendor_name as user_name FROM tbl_staff_attendance as tsa left join tbl_vendor as tu on(tsa.user_id=tu.id) WHERE DATE(tsa.start_day_datetime) = CURDATE() and tsa.user_id = '".$value['user_id']."'  order by tsa.id desc";
          $result_desc =  $db->fetchRow($sql_desc);
        }
        else
        {
                //echo "user";exit;
          $sql_asc = "SELECT tsa.* ,tu.name as user_name FROM tbl_staff_attendance as tsa left join tbl_user as tu on(tsa.user_id=tu.id) WHERE DATE(tsa.start_day_datetime) = CURDATE() and tsa.user_id = '".$value['user_id']."'  order by tsa.id asc";

          $result_asc =  $db->fetchRow($sql_asc);


          $sql_desc = "SELECT tsa.* ,tu.name as user_name FROM tbl_staff_attendance as tsa left join tbl_user as tu on(tsa.user_id=tu.id) WHERE DATE(tsa.start_day_datetime) = CURDATE() and tsa.user_id = '".$value['user_id']."'  order by tsa.id desc";
          $result_desc =  $db->fetchRow($sql_desc);
        }

            //$details = array('user_attendance_asc' => $result_asc,'user_attendance_desc' => $result_desc);
        $details = array(
          'id'=>$result_asc['id'],
          'user_id'=>$result_asc['user_name'],
          'user_type'=>$result_asc['user_type'],
          'contact_no'=>$result_asc['contact_no'],
          'start_day_datetime'=>$result_asc['start_day_datetime'],
          'start_day_latitude'=>$result_asc['start_day_latitude'],
          'start_day_longitude'=>$result_asc['start_day_longitude'],
          'end_day_datetime'=>$result_desc['start_day_datetime'],
          'end_day_latitude'=>$result_desc['start_day_latitude'],
          'end_day_longitude'=>$result_desc['start_day_longitude'],
          'created'=>$result_asc['created']
        );

        array_push($attendance, $details);


      }

      return $attendance;
    }
    public function searchAttendanceRecord($date_from,$date_to){ 
      $db = Zend_Db_Table::getDefaultAdapter();



      $attendance = array();
      function dateConverter($var)
      {
       $date = explode('-', $var);
       $final_date = $date['2'].'-'.$date['1'].'-'.$date['0'];
       return $final_date;
     } 
     if(!$date_from && $date_to){

       $cond  .="and date(created) = '".dateConverter($date_to)."'";

     }

     if($date_from && !$date_to){

       $cond  .="and date(created) = '".dateConverter($date_from)."'";
     }

     if($date_from && $date_to){
         //

       $cond  .="and date(created) between '".dateConverter($date_from)."' and '".dateConverter($date_to)."'";
     }
            //$query1 = "select * from tbl_staff_attendance where 1";
     $sql_grp = "SELECT * FROM tbl_staff_attendance WHERE 1 $cond  Group by user_id";

     $result_grp =  $db->fetchAll($sql_grp);
        // echo "<pre>";
        //  print_r($result_grp);exit; 

//left join tbl_user as tu  on (tv.assigned_user = tu.id)
     foreach ($result_grp as  $value)
     {

       if ($value['user_type']=="vendor") {
                //echo "vendor";exit;


                // $date_from = '2017-08-01';
                // $date_to = '2017-08-03';


        if(!$date_from && $date_to){ 
         $cond1  .="and date(tsa.start_day_datetime) = '".dateConverter($date_to)."'"; 
       }

       if($date_from && !$date_to){
         $cond1  .="and date(tsa.start_day_datetime) = '".dateConverter($date_from)."'";
       }


       if($date_from && $date_to){
         $cond1  .="and date(tsa.start_day_datetime) between '".dateConverter($date_from)."' and '".dateConverter($date_to)."'";
       }

       $sql_asc = "SELECT tsa.* ,tu.vendor_name as user_name FROM tbl_staff_attendance as tsa left join tbl_vendor as tu on(tsa.user_id=tu.id) WHERE 1 and tsa.user_id = '".$value['user_id']."' $cond1 order by tsa.id asc";

       $result_asc =  $db->fetchRow($sql_asc);

       $sql_desc = "SELECT tsa.* ,tu.vendor_name as user_name FROM tbl_staff_attendance as tsa left join tbl_vendor as tu on(tsa.user_id=tu.id) WHERE 1 $cond1 and tsa.user_id = '".$value['user_id']."'  order by tsa.id desc";
       $result_desc =  $db->fetchRow($sql_desc);
     }
     else
     {
                //echo "user";exit;

      if(!$date_from && $date_to){

       $cond2  .="and date(tsa.start_day_datetime) = '".dateConverter($date_to)."'";

     }

     if($date_from && !$date_to){

       $cond2  .="and date(tsa.start_day_datetime) = '".dateConverter($date_from)."'";
     }

     if($date_from && $date_to){

       $cond2  .="and date(tsa.start_day_datetime) between '".dateConverter($date_from)."' and '".dateConverter($date_to)."'";
     }
     $sql_asc = "SELECT tsa.* ,tu.name as user_name FROM tbl_staff_attendance as tsa left join tbl_user as tu on(tsa.user_id=tu.id) WHERE 1 $cond1 and tsa.user_id = '".$value['user_id']."'  order by tsa.id asc";

     $result_asc =  $db->fetchRow($sql_asc);


     $sql_desc = "SELECT tsa.* ,tu.name as user_name FROM tbl_staff_attendance as tsa left join tbl_user as tu on(tsa.user_id=tu.id) WHERE 1 $cond2 and tsa.user_id = '".$value['user_id']."'  order by tsa.id desc";
     $result_desc =  $db->fetchRow($sql_desc);
   }

            //$details = array('user_attendance_asc' => $result_asc,'user_attendance_desc' => $result_desc);
   $details = array(
    'id'=>$result_asc['id'],
    'user_id'=>$result_asc['user_name'],
    'user_type'=>$result_asc['user_type'],
    'contact_no'=>$result_asc['contact_no'],
    'start_day_datetime'=>$result_asc['start_day_datetime'],
    'start_day_latitude'=>$result_asc['start_day_latitude'],
    'start_day_longitude'=>$result_asc['start_day_longitude'],
    'end_day_datetime'=>$result_desc['start_day_datetime'],
    'end_day_latitude'=>$result_desc['start_day_latitude'],
    'end_day_longitude'=>$result_desc['start_day_longitude'],
    'created'=>$result_asc['created']
  );

   array_push($attendance, $details);
 }
 return $attendance;
}




public function getNatureOfWork(){
  $db = Zend_Db_Table::getDefaultAdapter();
  $sql ="select * from tbl_nature_of_work";
  $result =  $db->fetchAll($sql);
  return $result;
}
public function getNatureOfWorkById($id){
  $db = Zend_Db_Table::getDefaultAdapter();
  $sql ="select * from tbl_nature_of_work where id ='".$id."'";
  $result =  $db->fetchRow($sql);
  return $result;
}

/*-----------------------------------------------------*/

public function getTransferFor(){
  $db = Zend_Db_Table::getDefaultAdapter();
  $sql ="select * from tbl_transfer_for where status = '1' ";
  $result =  $db->fetchAll($sql);
  return $result;
}
public function getTransferForById($id){
  $db = Zend_Db_Table::getDefaultAdapter();
  $sql ="select * from tbl_transfer_for where id ='".$id."'";
  $result =  $db->fetchRow($sql);
  return $result;
} 

public function getSiteIdBySiteTypeId($role_type_id){
  $db = Zend_Db_Table::getDefaultAdapter();
  $sql = "SELECT description FROM tbl_expense_report WHERE po_no = '".$role_type_id."' ";
  $result =  $db->fetchRow($sql);
  $arr = explode('-',$result['description']); $arr1=array(); $k=0;
  foreach ($arr as $key => $value) {
   if($key!='0'){
    $arr1[$k]=$value;
    $k++;
  }
}
return $arr1;
}  


public function getExpensesByPoSite($po_no,$site_id){
  $db = Zend_Db_Table::getDefaultAdapter();
  try{   
    $sql = "SELECT SUM(amount) as sum FROM tbl_expense WHERE po_no = '".$po_no."' AND site_id ='".$site_id."' ";
    $result =  $db->fetchRow($sql);
    return $result['sum'];
  } catch(Exception $e){
    echo $e->getMessage();
    exit;
  }
}
public function getInvoiceByPoSite($po_no,$site_id){
  $db = Zend_Db_Table::getDefaultAdapter();
  $sql = "SELECT * tbl_invoice_details WHERE po_no = '".$po_no."' AND site_id ='".$site_id."' ";
  $result =  $db->fetchRow($sql);
  if($result){
    return true;
  }else{
    return false;
  }
}

public function getExpensesByPo($po_no){
  $db = Zend_Db_Table::getDefaultAdapter();
  $sql = "SELECT SUM(amount) as sum FROM tbl_expense WHERE po_no = '".$po_no."' ";
  $result =  $db->fetchRow($sql);
  return $result['sum'];
}

public function getLastFundDate($po_no,$site_id){
  $db = Zend_Db_Table::getDefaultAdapter();
  $sql = "SELECT transfer_date as last_date FROM tbl_expense WHERE po_no = '".$po_no."' AND site_id ='".$site_id."' order by id desc limit 1";
  $result =  $db->fetchRow($sql);
  return $result['last_date'];
}


public function assignedTo($po_no,$site_id){
  $db = Zend_Db_Table::getDefaultAdapter(); 
  $sql    = "SELECT transfered_to as transfer_to FROM tbl_expense WHERE 
  po_no = '".$po_no."' AND site_id ='".$site_id."' order by id desc limit 1";
  $result =  $db->fetchRow($sql);

  $sql1    = "SELECT name as name FROM tbl_user WHERE id = '".$result['transfer_to']."' ";
  $result1 =  $db->fetchRow($sql1);
  return $result1['name'];
}


public function getLatestStatus($po_no,$site_id){
  $db = Zend_Db_Table::getDefaultAdapter();
  $sql = "SELECT status as latest_status FROM tbl_expense WHERE po_no = '".$po_no."' AND site_id ='".$site_id."' order by id desc limit 1";
  $result =  $db->fetchRow($sql);
  if($result['latest_status']=='0'){ $res="Open"; }
  else if($result['latest_status']=='1'){ $res="Closed"; }
  else { $res="-";}
  return $res;
}

public function getInvoiceNumberByPoSite($po_no, $site_id)
{
  $db = Zend_Db_Table::getDefaultAdapter();
  $sql = "SELECT invoice_no FROM tbl_invoice_details WHERE po_no ='".$po_no."' AND site_id ='".$site_id."'";
  $result = $db->fetchRow($sql);
  return $result['invoice_no'];
}

public function getInvoiceValueByPoSite($po_no, $site_id)
{
  $db = Zend_Db_Table::getDefaultAdapter();
  $sql = "SELECT invoice_value FROM tbl_invoice_details WHERE po_no ='".$po_no."' AND site_id ='".$site_id."'";
  $result = $db->fetchRow($sql);
  return $result['invoice_value'];
}

public function getMarginByPoSite($po_no, $site_id)
{
  $db = Zend_Db_Table::getDefaultAdapter();
  $sql = "SELECT margin FROM tbl_invoice_details WHERE po_no ='".$po_no."' AND site_id ='".$site_id."'";
  $result = $db->fetchRow($sql);
  return $result['margin'];
}





public function todaySiteExpenses(){
  $db = Zend_Db_Table::getDefaultAdapter();
  $sum_siteexpenses = 0;
  $todaySiteExpenses_sql = "SELECT amount as amount FROM tbl_expense WHERE DATE(transfer_date) = CURDATE()";
  $todaySiteExpenses_qry = $db->fetchAll($todaySiteExpenses_sql);
  foreach ($todaySiteExpenses_qry as $keysite => $valuesite) {
   $sum_siteexpenses = $sum_siteexpenses + $valuesite['amount'];
 }
 return $sum_siteexpenses;
}

public function todayOfficeExpenses(){
  $db = Zend_Db_Table::getDefaultAdapter();
  $sum_officeexpenses = 0;
  $todayofficeExpenses_sql = "SELECT amount as amount FROM tbl_expense_office WHERE DATE(transfer_date) = CURDATE()";
  $todayofficeExpenses_qry = $db->fetchAll($todayofficeExpenses_sql);
  foreach ($todayofficeExpenses_qry as $keyoffice => $valueoffice) {
   $sum_officeexpenses = $sum_officeexpenses + $valueoffice['amount'];
 }
 return $sum_officeexpenses;
}

public function todayTotalExpenses($today_site_expenses,$today_office_expenses){
  $total = $today_site_expenses + $today_office_expenses;
  return $total;
}

/*---------------------for month-------------------------*/

public function currentMonthSiteExpenses(){
  $db = Zend_Db_Table::getDefaultAdapter();
  $sum_siteexpenses = 0;
  $todaySiteExpenses_sql = "SELECT amount as amount FROM tbl_expense WHERE MONTH(DATE(transfer_date)) = MONTH(CURDATE())";
  $todaySiteExpenses_qry = $db->fetchAll($todaySiteExpenses_sql);
  foreach ($todaySiteExpenses_qry as $keysite => $valuesite) {
   $sum_siteexpenses = $sum_siteexpenses + $valuesite['amount'];
 }
 return $sum_siteexpenses;
}

public function currentMonthOfficeExpenses(){
  $db = Zend_Db_Table::getDefaultAdapter();
  $sum_officeexpenses = 0;
  $todayofficeExpenses_sql = "SELECT amount as amount FROM tbl_expense_office WHERE MONTH(DATE(transfer_date)) = MONTH(CURDATE())";
  $todayofficeExpenses_qry = $db->fetchAll($todayofficeExpenses_sql);
  foreach ($todayofficeExpenses_qry as $keyoffice => $valueoffice) {
   $sum_officeexpenses = $sum_officeexpenses + $valueoffice['amount'];
 }
 return $sum_officeexpenses;
}

public function currentMonthTotalExpenses($today_site_expenses,$today_office_expenses){
  $total = $today_site_expenses + $today_office_expenses;
  return $total;
}


/*---------------------for financial year-------------------------*/

public function currentFinancialYearSiteExpenses(){
  $current_year  = date('Y');
  $nxt_year = $current_year + 1;
  $date1 = $current_year.'-04-01';
  $date2 = $nxt_year.'-03-31';
  $db = Zend_Db_Table::getDefaultAdapter();
  $sum_siteexpenses = 0;
  $todaySiteExpenses_sql = "SELECT amount as amount FROM tbl_expense WHERE DATE(transfer_date) BETWEEN 
  '".$date1."' AND '".$date2."' ";
  $todaySiteExpenses_qry = $db->fetchAll($todaySiteExpenses_sql);
  foreach ($todaySiteExpenses_qry as $keysite => $valuesite) {
   $sum_siteexpenses = $sum_siteexpenses + $valuesite['amount'];
 }
 return $sum_siteexpenses;
}

public function currentFinancialYearOfficeExpenses(){
  $current_year  = date('Y');
  $nxt_year = $current_year+1;
  $date1 = $current_year.'-04-01';
  $date2 = $nxt_year.'-03-31';
  $db = Zend_Db_Table::getDefaultAdapter();
  $sum_officeexpenses = 0;
  $todayofficeExpenses_sql = "SELECT amount as amount FROM tbl_expense_office WHERE DATE(transfer_date) BETWEEN 
  '".$date1."' AND '".$date2."' ";
  $todayofficeExpenses_qry = $db->fetchAll($todayofficeExpenses_sql);
  foreach ($todayofficeExpenses_qry as $keyoffice => $valueoffice) {
   $sum_officeexpenses = $sum_officeexpenses + $valueoffice['amount'];
 }
 return $sum_officeexpenses;
}

public function currentFinancialYearTotalExpenses($today_site_expenses,$today_office_expenses){
  $total = $today_site_expenses + $today_office_expenses;
  return $total;
}

public function getPoDate($po_no)
{

}
public function getMaterialData()
{
 $db = Zend_Db_Table::getDefaultAdapter();
 try{   
  $query = "Select tp.product_name,ti.quantity from tbl_inventory  ti inner join tbl_products tp ON ti.product_id = tp.id";
  $result =  $db->fetchAll($query);
  return $result;
} catch(Exception $e){
  echo $e->getMessage();
  exit;
}
}

public function getTotalBalance($expense_id) {
        $db = Zend_Db_Table::getDefaultAdapter();
        $expenseDetailsTotalQuery = $db->select()
		->from('tbl_site_expense_details', array("sum(spent_amount) as balance_amount"))
		->where('site_expense_id = ?', $expense_id)
		->where('status = 1');
		$expenseDetailsTotalResult = $db->fetchRow($expenseDetailsTotalQuery);
		
        // 		$expenseTotal = $expenseDetailsTotalResult['balance_amount'];
        $b = str_replace( ',', '', $expenseDetailsTotalResult['balance_amount']);
                    if( is_numeric( $b ) ) {
                    $expenseDetailsTotalResult['balance_amount'] = $b;
                    }
                    $expenseTotal = $b;
//                     print_r($expenseTotal);
// 			exit;
            return $expenseTotal;   
    }
    
}
?>
