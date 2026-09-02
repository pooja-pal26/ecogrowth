<?php
class Application_Model_Admin extends Zend_Db_Table_Abstract
{   

    /**
	* getUserLoginDetailByWebLoginCode() method is used to get user details
	* @param Array
	* @return True 
	* add by Ajay
	*/
	public function getUserLoginDetailByWebLoginCode($WebLoginID){ 
        $db =  Zend_Db_Table::getDefaultAdapter();
        $query = "SELECT * FROM logi_user_login_detail WHERE WebLoginID='".$WebLoginID."'";   
        return $result = $db->fetchRow($query);
    }

    /**
	* getAdminRecord() method is used to get user all details
	* @param Array
	* @return True 
	* add by Ajay
	*/
    public function getAdminRecord($id)
    {
		$db =  Zend_Db_Table::getDefaultAdapter();
		$query = "SELECT * from logi_admin where id='".$id."'"; 		 
		return $db->fetchRow($query);
	}



		 /**
	* getUserRecord() method is used to get user all details
	* @param Array
	* @return True 
	* add by Puneet
	*/
    public function getUserRecord($id)
    {
		$db =  Zend_Db_Table::getDefaultAdapter();
		 $query = "SELECT * from tbl_user where id='".$id."'";

		return $db->fetchRow($query);
	}

	/**
	* getAllAdminDetailsByEmailId() method is used to get user details by email id
	* @param Array
	* @return True 
	* add by Ajay
	*/
	public function getAllAdminDetailsByEmailId($email)
    {
		$db =  Zend_Db_Table::getDefaultAdapter();
		$query = "SELECT * from logi_admin where email='".$email."'"; 		 
		return $db->fetchRow($query);
	}



		/**
	* getUserDetailsByEmailId() method is used to get user details by email id
	* @param Array
	* @return True 
	* add by Ajay
	*/
	public function getUserDetailsByEmailId($email)
    {
		$db =  Zend_Db_Table::getDefaultAdapter();
		$query = "SELECT * from tbl_user where email_id='".$email."'"; 		 
		return $db->fetchRow($query);
	}

	/**
	* getAllAdminDetailsByEmailId() method is used to get user details by email id
	* @param Array
	* @return True 
	* add by Ajay
	*/
	public function checkValidTokenData($token, $tokenExpireTime)
    {
		$db =  Zend_Db_Table::getDefaultAdapter();
		$query = "SELECT * from logi_admin where sha1(email)='".$token."' and token = '".$token."' and token_status='1' and token_date_time > DATE_SUB(CURDATE(),INTERVAL ".$tokenExpireTime." hour)"; 		 
		return $db->fetchRow($query);
	}




	/**
	* checkValidUserTokenData() method is used to get user details by email id
	* @param Array
	* @return True 
	* add by Ajay
	*/
	public function checkValidUserTokenData($token, $tokenExpireTime)
    {
		$db =  Zend_Db_Table::getDefaultAdapter();
	    $query = "SELECT * from tbl_user  where sha1(email_id)='".$token."' and token = '".$token."' and token_status='1' and token_date_time > DATE_SUB(CURDATE(),INTERVAL ".$tokenExpireTime." hour)"; 		
		
		return $db->fetchRow($query);
	}

    
    /**
	* checkValidOTPData() method is used to get user details by otp
	* @param Array
	* @return True 
	* add by Puneet
	*/

	public function checkValidOTPData($otp, $otpExpireTime){
		$db =  Zend_Db_Table::getDefaultAdapter();
		$query = "SELECT * from tbl_user where otp='".$otp."'  and otp_status='1' and otp_date_time > DATE_SUB(CURDATE(),INTERVAL ".$otpExpireTime." hour)"; 		 
		return $db->fetchRow($query);
	}




	public function checkValidAdminOTPData($otp, $tokenExpireTime)
    {
		$db =  Zend_Db_Table::getDefaultAdapter();
		$query = "SELECT * from logi_admin where  otp = '".$otp."' and otp_status='1' and token_date_time > DATE_SUB(CURDATE(),INTERVAL ".$tokenExpireTime." hour)"; 		 
		return $db->fetchRow($query);
	}

}
