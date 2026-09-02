<?php

class VendorController extends Zend_Controller_Action
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
        $this->id              = $authStorage->read()->id;
        $this->role            = $authStorage->read()->role;
        $this->vendor          = new Application_Model_Vendor();
    }
    public function indexAction()
    {
        try {
            $this->checklogin(); 
            $this->view->messages  = $this->_flashMessenger->getMessages();  
            $vendorDetailsQuery = $this->dbAdapter->select()
            ->from("tbl_vendor", array("id","vendor_name","contact_person","contact_number","email"))
            ->where("is_active = 1")
            ->where("status = 1");
            $this->view->vendorDetails = $vendorDetailsResult = $this->dbAdapter->fetchAll($vendorDetailsQuery);
        } catch(Exception $e){
            echo $e->getMessages();
            exit;
        }
    }
    public function deactivatedVendorListAction()
    {
      try {
         $this->checklogin(); 
         $this->view->messages  = $this->_flashMessenger->getMessages();  
         $deactivatedVendorDetailsQuery = $this->dbAdapter->select()
         ->from("tbl_vendor", array("id","vendor_name","prop_director_name","contact_person","contact_number","email"))
         ->where("is_active = 0")
         ->where("status = 1");
         $this->view->deactivatedVendorDetails = $deactivatedVendorDetailsResult = $this->dbAdapter->fetchAll($deactivatedVendorDetailsQuery);
     } catch(Exception $e){
         echo $e->getMessages();
         exit;
     }
 }

 public function createVendorAction()
 {
    try {
        $this->checklogin(); 
        $this->view->messages  = $this->_flashMessenger->getMessages();
        $params = $this->getRequest()->getParams();
        $master = new Application_Model_Master; 
        $this->view->statesList = $statesMasterList = $master->getStateNameMasterList();
        $this->view->bankList   = $bankMasterList   = $master->getBankNameMasterList();
        $this->view->relativeExperienceList = $relativeExperienceMaster = $master->getRelativeExperienceMasterList();
        $this->view->organizationTypeList = $organizationTypeMaster = $master->getOrganizationTypeMasterList();
        $this->view->associationYearsList = $associationYearsMaster = $master->getAssociationYearsMasterList();
        $this->view->geographicalPresenceList = $geographicalPresenceMaster = $master->getGeographicalPresenceMasterList();
        $this->view->vendorMajorClientsList = $vendorMajorClientsMaster = $master->getMajorClientsMasterList();
        $this->view->teamStrengthList = $teamStrengthMaster = $master->getTeamStrengthMasterList();
        $this->view->annualTurnoverList = $annualTurnoverMaster = $master->getAnnualTurnoverMasterList();
        $this->view->workHandlintAmountList = $workHandlintAmountMaster = $master->getWorkHandlingAmountMasterList();
        if($this->getRequest()->isPost()) 
        {
            if ($params['nameOfCompany'] == "") {
                $params['error'] = "Company Name Missing! Please Enter Company Name.";
                $this->view->params = $params;
            } else if ($params['propDirName'] == "") {
                $params['error'] = "Proprietor or Director Name Missing! Please Enter Proprietor or Director Name.";
                $this->view->params = $params;
            } else if ($params['contactPerson'] == "") {
                $params['error'] = "Contact Person Name Missing! Please Enter Contact Person Name.";
                $this->view->params = $params;
            } else if ($params['contactNumber'] == "") {
               $params['error'] = "Contact Number Missing! Please Enter Contact Number.";
               $this->view->params = $params;
           } else if ($params['address'] == "") {
               $params['error'] = "Address is Missing! Please Enter Address.";
               $this->view->params = $params;
           } else if ($params['bankName'] == "") {
               $params['error'] = "Bank Name is Missing! Please Enter Bank Name.";
               $this->view->params = $params;
           } else if ($params['bankAccountNumber'] == "") {
               $params['error'] = "Bank Account Number is Missing! Please Enter Bank Account Number.";
               $this->view->params = $params;
           } else if ($params['panNumber'] == "") {
               $params['error'] = "PAN Number is Missing! Please Enter PAN Number.";
               $this->view->params = $params;
           } else if ($params['bankNeftCode'] == "") {
               $params['error'] = "Bank IFS Code is Missing! Please Enter Bank IFS Code.";
               $this->view->params = $params;
           } else {
            $checkDuplicateData = $this->vendor->checkDuplicateVendorData(array('pan_card_number'=>$params['panNumber'], 'vendor_name'=>$params['nameOfCompany']));
            if ($checkDuplicateData) {
                $params['error'] = "Duplicate Data Found! Entered data already exists.";
                $this->view->params = $params;
            } else {
                $insertData = array();
                $insertData['vendor_name']          = trim(ucwords(strtolower($params['nameOfCompany'])));
                $insertData['prop_director_name']   = trim(ucwords(strtolower($params['propDirName'])));
                $insertData['contact_person']       = trim(ucwords(strtolower($params['contactPerson'])));
                $insertData['contact_number']       = trim(ucwords(strtolower($params['contactNumber'])));
                $insertData['address']              = trim(ucwords(strtolower($params['address'])));
                if ($params['emailId']) {
                    $insertData['email']                = trim(strtolower($params['emailId']));
                }
                if ($params['regHeadOfficeAddress']) {
                    $insertData['registered_office_address'] = trim(ucwords(strtolower($params['regHeadOfficeAddress'])));
                }
                $insertData['registration_number']      = trim(strtoupper($params['registrationNumber']));
                $insertData['relative_experience']      = trim($params['experience']);
                $insertData['organization_type']        = trim($params['organizationType']);
                $insertData['association_with_ril']     = trim($params['associationWithRil']);
                $insertData['geographical_presence']    = trim($params['geographicalPresence']);
                $insertData['major_clients']            = trim($params['majorClients']);
                $insertData['other_work_intrest']       = trim($params['interestOtherWorkType']);
                $insertData['sop_sign_off']             = trim($params['sopQapSignOff']);
                $insertData['sop_for_quality']          = trim($params['sopForQuality']);
                $insertData['total_team_available']     = trim($params['totalTeam']);
                $insertData['plant_and_machinery']      = trim($params['plantAndMechnery']);
                $insertData['organization_chart']       = trim($params['organizationChart']);
                $insertData['annual_turnover']          = trim($params['annualTurnover']);
                $insertData['audited_balance_sheet']    = trim($params['auditedBalanceSheet']);
                $insertData['work_handle_amount']       = trim($params['annualWorkHandleCapacity']);
                $targetDir = "uploads/vendor/documents/";
                if ($_FILES['experienceCertificate']['name']) {
                    $targetFile = $targetDir.time().basename($_FILES['experienceCertificate']['name']);
                    $imageFileType = strtolower(pathinfo($targetFile,PATHINFO_EXTENSION));
                    if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
                        && $imageFileType != "gif" ) {
                        $params['error'] = "Image type not supported. Please upload JPG, JPEG, PNG or GIF Images only.";
                    $this->view->params = $params;
                } else {
                    move_uploaded_file($_FILES["experienceCertificate"]["tmp_name"], $targetFile);
                    $insertData['experience_certificate_path'] = "/".$targetFile;
                }
            }
            if ($_FILES['panCard']['name']) {
                $targetFile = $targetDir.time().basename($_FILES['panCard']['name']);
                $imageFileType = strtolower(pathinfo($targetFile,PATHINFO_EXTENSION));
                if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
                    && $imageFileType != "gif" ) {
                    $params['error'] = "Image type not supported. Please upload JPG, JPEG, PNG or GIF Images only.";
                $this->view->params = $params;
            } else {
                move_uploaded_file($_FILES["panCard"]["tmp_name"], $targetFile);
                $insertData['pan_card_path'] = "/".$targetFile;
            }
        }
        if ($_FILES['gstDocument']['name']) {
            $targetFile = $targetDir.time().basename($_FILES['gstDocument']['name']);
            $imageFileType = strtolower(pathinfo($targetFile,PATHINFO_EXTENSION));
            if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
                && $imageFileType != "gif" ) {
                $params['error'] = "Image type not supported. Please upload JPG, JPEG, PNG or GIF Images only.";
            $this->view->params = $params;
        } else {
            move_uploaded_file($_FILES["gstDocument"]["tmp_name"], $targetFile);
            $insertData['gst_certificate_path'] = "/".$targetFile;
        }
    }
    if ($_FILES['registrationCertificate']['name']) {
        $targetFile = $targetDir.time().basename($_FILES['registrationCertificate']['name']);
        $imageFileType = strtolower(pathinfo($targetFile,PATHINFO_EXTENSION));
        if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
            && $imageFileType != "gif" ) {
            $params['error'] = "Image type not supported. Please upload JPG, JPEG, PNG or GIF Images only.";
        $this->view->params = $params;
    } else {
        move_uploaded_file($_FILES["registrationCertificate"]["tmp_name"], $targetFile);
        $insertData['registration_certificate_path'] = "/".$targetFile;
    }
}
$insertData['created_by']              = $this->id;
$insertData['created_at']              = date('Y-m-d H:i:s');
$this->dbAdapter->insert("tbl_vendor", $insertData);
$lastInsertedId = $this->dbAdapter->lastInsertId();
$bankGstData = array();
$bankGstData['vendor_id']               = $lastInsertedId;
$bankGstData['bank_name']               = trim($params['bankName']);
$bankGstData['bank_branch_name']        = trim(ucwords(strtolower($params['bankBranchName'])));
$bankGstData['bank_address']            = trim(ucwords(strtolower($params['bankAddress'])));
$bankGstData['bank_contact_number']     = trim(ucwords(strtolower($params['bankContactNumber'])));
$bankGstData['bank_account_no']         = trim(strtoupper($params['bankAccountNumber']));
$bankGstData['bank_micr_code']          = trim(strtoupper($params['bankMicrCode']));
$bankGstData['bank_ifsc_code']          = trim(strtoupper($params['bankNeftCode']));
$bankGstData['registration_number']     = trim(strtoupper($params['registrationNumber']));
$bankGstData['pan_number']              = trim(strtoupper($params['panNumber']));
$bankGstData['esi_number']              = trim(strtoupper($params['esiNumber']));
$bankGstData['gst_number']              = trim(strtoupper($params['gstNumber']));
$bankGstData['gst_state_name']          = trim($params['gstState']);
$bankGstData['pf_number']               = trim(strtoupper($params['pfNumber']));
$bankGstData['created_by']              = $this->id;
$bankGstData['created_at']              = date('Y-m-d H:i:s');
$this->dbAdapter->insert("tbl_vendor_bank_and_gst_details", $bankGstData);
$this->_flashMessenger->addMessage(array("success"=>"Vendor details has been saved successfully."));
$this->_redirect("/vendor");
}
}
}
} catch(Exception $e){
    echo $e->getMessage();
    exit;
}
}
public function vendorManpowerListAction(){   
    $this->checklogin(); 
    $params                = $this->view->params = $this->getRequest()->getParams(); 
    $this->view->totalnum   = $params['page'];
    $roles                 = new Application_Model_User();
    $this->view->vendor_list = $vendor_list  = $roles->getallvendorsManpower($params['v_id']);
    $this->view->vendordata = $vendordata  = $roles->getVendorListbyid($params['v_id']);
    $this->view->messages  = $this->_flashMessenger->getMessages();  
    $page=$this->_getParam('page',1);
    $paginator = Zend_Paginator::factory($vendor_list);      
         $paginator->setCurrentPageNumber($this->getRequest()->getParam('page')); // page number
         $paginator->setItemCountPerPage(10); // number of items to show per page
         $this->view->paginator = $paginator;
         $this->view->totalrec = $paginator->getTotalItemCount(); 

     }
     public function editVendorInfoAction()
     {
        try {
            $this->checklogin(); 
            $this->view->messages  = $this->_flashMessenger->getMessages();
            $params = $this->getRequest()->getParams();
            $master = new Application_Model_Master; 
            $this->view->statesList = $statesMasterList = $master->getStateNameMasterList();
            $this->view->bankList   = $bankMasterList   = $master->getBankNameMasterList();
            $this->view->relativeExperienceList = $relativeExperienceMaster = $master->getRelativeExperienceMasterList();
            $this->view->organizationTypeList = $organizationTypeMaster = $master->getOrganizationTypeMasterList();
            $this->view->associationYearsList = $associationYearsMaster = $master->getAssociationYearsMasterList();
            $this->view->geographicalPresenceList = $geographicalPresenceMaster = $master->getGeographicalPresenceMasterList();
            $this->view->vendorMajorClientsList = $vendorMajorClientsMaster = $master->getMajorClientsMasterList();
            $this->view->teamStrengthList = $teamStrengthMaster = $master->getTeamStrengthMasterList();
            $this->view->annualTurnoverList = $annualTurnoverMaster = $master->getAnnualTurnoverMasterList();
            $this->view->workHandlintAmountList = $workHandlintAmountMaster = $master->getWorkHandlingAmountMasterList();
            $vendorDetailsQuery = $this->dbAdapter->select()
            ->from("tbl_vendor as tv", array("*"))
            ->joinLeft("tbl_vendor_bank_and_gst_details as tvb", "tvb.vendor_id = tv.id", array("*"))
            ->where("md5(tv.id) = ?", $params['vendor-profile-id']);
            $this->view->vendorDetails = $vendorDetailsResult = $this->dbAdapter->fetchRow($vendorDetailsQuery);
            if($this->getRequest()->isPost()) 
            {
                if (empty($params['nameOfCompany']) || $params['nameOfCompany'] == "") {
                    $this->_flashMessenger->addMessage(array('error'=>'Company or Vendor Name is Missing! Please try again.'));
                    $this->_redirect('vendor/edit-vendor-info/vendor-profile-id/'.$params['vendor-profile-id']); 
                } else if (empty($params['propDirName']) || $params['propDirName'] == "") {
                    $this->_flashMessenger->addMessage(array('error'=>'Proprietor or Director Name is Missing! Please try again.'));
                    $this->_redirect('vendor/edit-vendor-info/vendor-profile-id/'.$params['vendor-profile-id']); 
                } else if (empty($params['contactPerson']) || $params['contactPerson'] == "") {
                    $this->_flashMessenger->addMessage(array('error'=>'Contact Person Name is Missing! Please try again.'));
                    $this->_redirect('vendor/edit-vendor-info/vendor-profile-id/'.$params['vendor-profile-id']); 
                } else if (empty($params['contactNumber']) || $params['contactNumber'] == "") {
                 $this->_flashMessenger->addMessage(array('error'=>'Contact Number is Missing! Please try again.'));
                 $this->_redirect('vendor/edit-vendor-info/vendor-profile-id/'.$params['vendor-profile-id']); 
             } else if (empty($params['address']) || $params['address'] == "") {
                $this->_flashMessenger->addMessage(array('error'=>'Address is Missing! Please try again.'));
                $this->_redirect('vendor/edit-vendor-info/vendor-profile-id/'.$params['vendor-profile-id']); 
            } else if (empty($params['bankName']) || $params['bankName'] == "") {
                $this->_flashMessenger->addMessage(array('error'=>'Bank Name is Missing! Please try again.'));
                $this->_redirect('vendor/edit-vendor-info/vendor-profile-id/'.$params['vendor-profile-id']); 
            } else if (empty($params['bankAccountNumber']) || $params['bankAccountNumber'] == "") {
               $this->_flashMessenger->addMessage(array('error'=>'Bank Account Number Missing! Please try again.'));
               $this->_redirect('vendor/edit-vendor-info/vendor-profile-id/'.$params['vendor-profile-id']); 
           } else if (empty($params['bankNeftCode']) || $params['bankNeftCode'] == "") {
            $this->_flashMessenger->addMessage(array('error'=>'Bank NEFT/RTGS Code Missing! Please try again.'));
            $this->_redirect('vendor/edit-vendor-info/vendor-profile-id/'.$params['vendor-profile-id']); 
        } else if (empty($params['panNumber']) || $params['panNumber'] == "") {
            $this->_flashMessenger->addMessage(array('error'=>'PAN Number Missing! Please try again.'));
            $this->_redirect('vendor/edit-vendor-info/vendor-profile-id/'.$params['vendor-profile-id']); 
        } else {
            $checkDuplicateData = $this->vendor->checkDuplicateVendorData(array('pan_card_number'=>$params['panNumber'], 'vendor_name'=>$params['nameOfCompany'], 'vendor_id'=>$params['vendor-profile-id']));
            if ($checkDuplicateData) {
               $this->_flashMessenger->addMessage(array('error'=>'Duplicate Data Found! Please try again.'));
               $this->_redirect('vendor/edit-vendor-info/vendor-profile-id/'.$params['vendor-profile-id']); 
           } else {
               $updateVendorData = array();
               $updateVendorData['vendor_name']          = trim(ucwords(strtolower($params['nameOfCompany'])));
               $updateVendorData['prop_director_name']   = trim(ucwords(strtolower($params['propDirName'])));
               $updateVendorData['contact_person']       = trim(ucwords(strtolower($params['contactPerson'])));
               $updateVendorData['contact_number']       = trim(ucwords(strtolower($params['contactNumber'])));
               $updateVendorData['email']                = trim(strtolower($params['emailId']));
               $updateVendorData['address']              = trim(ucwords(strtolower($params['address'])));
               $updateVendorData['registered_office_address'] = trim(ucwords(strtolower($params['regHeadOfficeAddress'])));
               $updateVendorData['registration_number']      = trim(strtoupper($params['registrationNumber']));
               $updateVendorData['relative_experience']      = trim($params['experience']);
               $updateVendorData['organization_type']        = trim($params['organizationType']);
               $updateVendorData['association_with_ril']     = trim($params['associationWithRil']);
               $updateVendorData['geographical_presence']    = trim($params['geographicalPresence']);
               $updateVendorData['major_clients']            = trim($params['majorClients']);
               $updateVendorData['other_work_intrest']       = trim($params['interestOtherWorkType']);
               $updateVendorData['sop_sign_off']             = trim($params['sopQapSignOff']);
               $updateVendorData['sop_for_quality']          = trim($params['sopForQuality']);
               $updateVendorData['total_team_available']     = trim($params['totalTeam']);
               $updateVendorData['plant_and_machinery']      = trim($params['plantAndMechnery']);
               $updateVendorData['organization_chart']       = trim($params['organizationChart']);
               $updateVendorData['annual_turnover']          = trim($params['annualTurnover']);
               $updateVendorData['audited_balance_sheet']    = trim($params['auditedBalanceSheet']);
               $updateVendorData['work_handle_amount']       = trim($params['annualWorkHandleCapacity']);
               $targetDir = "uploads/vendor/documents/";
               if ($_FILES['experienceCertificate']['name']) {
                $targetFile = $targetDir.time().basename($_FILES['experienceCertificate']['name']);
                $imageFileType = strtolower(pathinfo($targetFile,PATHINFO_EXTENSION));
                if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
                    && $imageFileType != "gif" ) {
                    $params['error'] = "Image type not supported. Please upload JPG, JPEG, PNG or GIF Images only.";
                $this->view->params = $params;
            } else {
                move_uploaded_file($_FILES["experienceCertificate"]["tmp_name"], $targetFile);
                $updateVendorData['experience_certificate_path'] = "/".$targetFile;
            }
        }
        if ($_FILES['panCard']['name']) {
            $targetFile = $targetDir.time().basename($_FILES['panCard']['name']);
            $imageFileType = strtolower(pathinfo($targetFile,PATHINFO_EXTENSION));
            if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
                && $imageFileType != "gif" ) {
                $params['error'] = "Image type not supported. Please upload JPG, JPEG, PNG or GIF Images only.";
            $this->view->params = $params;
        } else {
            move_uploaded_file($_FILES["panCard"]["tmp_name"], $targetFile);
            $updateVendorData['pan_card_path'] = "/".$targetFile;
        }
    }
    if ($_FILES['gstDocument']['name']) {
        $targetFile = $targetDir.time().basename($_FILES['gstDocument']['name']);
        $imageFileType = strtolower(pathinfo($targetFile,PATHINFO_EXTENSION));
        if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
            && $imageFileType != "gif" ) {
            $params['error'] = "Image type not supported. Please upload JPG, JPEG, PNG or GIF Images only.";
        $this->view->params = $params;
    } else {
        move_uploaded_file($_FILES["gstDocument"]["tmp_name"], $targetFile);
        $updateVendorData['gst_certificate_path'] = "/".$targetFile;
    }
}
if ($_FILES['registrationCertificate']['name']) {
    $targetFile = $targetDir.time().basename($_FILES['registrationCertificate']['name']);
    $imageFileType = strtolower(pathinfo($targetFile,PATHINFO_EXTENSION));
    if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
        && $imageFileType != "gif" ) {
        $params['error'] = "Image type not supported. Please upload JPG, JPEG, PNG or GIF Images only.";
    $this->view->params = $params;
} else {
    move_uploaded_file($_FILES["registrationCertificate"]["tmp_name"], $targetFile);
    $updateVendorData['registration_certificate_path'] = "/".$targetFile;
}
}
$updateVendorData['updated_at']              = date('Y-m-d H:i:s');
$this->dbAdapter->update("tbl_vendor", $updateVendorData, array("md5(id) = ?"=>$params['vendor-profile-id']));
$updateBankGstData = array();
$updateBankGstData['bank_name']               = trim($params['bankName']);
$updateBankGstData['bank_branch_name']        = trim(ucwords(strtolower($params['bankBranchName'])));
$updateBankGstData['bank_address']            = trim(ucwords(strtolower($params['bankAddress'])));
$updateBankGstData['bank_contact_number']     = trim(ucwords(strtolower($params['bankContactNumber'])));
$updateBankGstData['bank_account_no']         = trim(strtoupper($params['bankAccountNumber']));
$updateBankGstData['bank_micr_code']          = trim(strtoupper($params['bankMicrCode']));
$updateBankGstData['bank_ifsc_code']          = trim(strtoupper($params['bankNeftCode']));
$updateBankGstData['registration_number']     = trim(strtoupper($params['registrationNumber']));
$updateBankGstData['pan_number']              = trim(strtoupper($params['panNumber']));
$updateBankGstData['esi_number']              = trim(strtoupper($params['esiNumber']));
$updateBankGstData['gst_number']              = trim(strtoupper($params['gstNumber']));
$updateBankGstData['gst_state_name']          = trim($params['gstState']);
$updateBankGstData['pf_number']               = trim(strtoupper($params['pfNumber']));
$updateBankGstData['updated_at']              = date('Y-m-d H:i:s');
$this->dbAdapter->update("tbl_vendor_bank_and_gst_details", $updateBankGstData, array("md5(vendor_id) =?"=>$params['vendor-profile-id']));
$this->_flashMessenger->addMessage(array("success"=>"Vendor details has been updated successfully."));
$this->_redirect("/vendor");
}
}
}
} catch(Exception $e){
    echo $e->getMessage();
    exit;
}
}
public function viewVendorProfileAction()
{
    try {
        $this->checklogin();
        $params = $this->getRequest()->getParams();
        $vendorDetailsQuery = $this->dbAdapter->select()
        ->from("tbl_vendor as tv", array("*"))
        ->joinLeft("tbl_vendor_bank_and_gst_details as tvb", "tvb.vendor_id = tv.id", array("*"))
        ->where("tv.id = ?", $params['vendor_id']);
        $this->view->vendorDetails = $vendorDetailsResult = $this->dbAdapter->fetchRow($vendorDetailsQuery);
        $this->_helper->layout()->disableLayout();
    } catch(Exception $e){
        echo $e->getMessage();
        exit;
    }
}
public function deactivateVendorProfileAction()
{
 try {
    $this->checklogin();
    $response = array();
    $updateData = array();
    $params = $this->getRequest()->getParams();
    if ($params['vendor_id'] != "") {
       $updateData['is_active'] = "0";
       $where['id = ?'] = $params['vendor_id'];
       $this->dbAdapter->update("tbl_vendor", $updateData, $where);
       $response['flag'] = true;
       $response['message'] = "Vendor Profile has been deactivated successfully.";   
   } else {
    $response['flag'] = false;
    $response['message'] = "Please try after refreshing the page.";
}
} catch(Exception $e){
    $response['flag'] = false;
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
exit;
}
public function activateVendorProfileAction()
{
 try {
    $this->checklogin();
    $response = array();
    $updateData = array();
    $params = $this->getRequest()->getParams();
    if ($params['vendor_id'] != "") {
       $updateData['is_active'] = "1";
       $where['id = ?'] = $params['vendor_id'];
       $this->dbAdapter->update("tbl_vendor", $updateData, $where);
       $response['flag'] = true;
       $response['message'] = "Vendor Profile has been activated successfully.";   
   } else {
    $response['flag'] = false;
    $response['message'] = "Please try after refreshing the page.";
}
} catch(Exception $e){
    $response['flag'] = false;
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
exit;
}
public function deleteVendorProfileAction()
{
 try {
    $this->checklogin();
    $response = array();
    $updateData = array();
    $params = $this->getRequest()->getParams();
    if ($params['vendor_id'] != "") {
        $updateData['status'] = "2";
        $where['id = ?'] = $params['vendor_id'];
        $this->dbAdapter->update("tbl_vendor", $updateData, $where);
        $response['flag'] = true;
        $response['message'] = "Vendor Profile has been deleted successfully.";   
    } else {
        $response['flag'] = false;
        $response['message'] = "Please try after refreshing the page.";
    }
} catch(Exception $e){
    $response['flag'] = false;
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
exit;
}
public function editVendorManpowerInfoAction(){   
  $this->checklogin(); 
  $this->view->messages  = $this->_flashMessenger->getMessages();
  $db = $this->db=Zend_Db_Table::getDefaultAdapter();
  $dbAdapter = $this->dbAdapter;
  $auth = Zend_Auth::getInstance();
  $authStorage = $auth->getStorage();
  $params = $this->getRequest()->getParams();
  $user = new Application_Model_User(); 
  $this->view->getVendorManpowerListbyid = $result = $user->getVendorManpowerListbyid($params["m_id"]);

  $this->view->getalldepartment = $result = $user->getDepartment();

  if($this->getRequest()->isPost()) 
  {

   if($params['name'] == ''){
    $this->view->errorMessage = "Please Enter Name.";
}else{
    $roleData  = array();
    $roleData['name']               = $params['name'];
    $roleData['department']         = $params['department'];
    $roleData['experience']         = $params['exp'];
    $roleData['joining_date']       = $params['due_date'];
    $where = array();
    $where[] = $this->dbAdapter->quoteInto('id = ?', $params['m_id']);
    $this->dbAdapter->update('tbl_vendor_manpower', $roleData,$where);
               // $this->dbAdapter->insert('tbl_vendor', $roleData);


    $this->_flashMessenger->addMessage('Vendor Manpower has been successfully Updated!');
                //$this->_redirect('/vendor/');
    $this->_redirect('/vendor/edit-vendor-manpower-info/m_id/'.$params["m_id"].'');


}
}
}

public function getVendorListAction()
{
    try {
        $this->checklogin();
        $response = array();
        $vendorListQuery = $this->dbAdapter->select()
        ->from("tbl_vendor", array("id","vendor_name","contact_person"))
        ->where("status = 1")
        ->where("is_active = 1");
        $vendorListResult = $this->dbAdapter->fetchAll($vendorListQuery);
        if ($vendorListResult) {
            $vendor_name_options = '<option value="">Please Select</option>';
            foreach ($vendorListResult as $vendor) {
                $vendor_name_options .= '<option value="'.$vendor['id'].'">'.$vendor['vendor_name'].'</option>';
            }
            $response['flag'] = true;
            $response['vendor_list'] = $vendor_name_options;
        }
    } catch(Exception $e){
        $response['flag'] = false;
        $response['title'] = "Internal Server Error!";
        $response['message'] = $e->getMessage();
    }
    echo json_encode($response);
    exit;
}

public function getVendorSupervisorListByVendorIdAction()
{
    try {
        $this->checklogin();
        $response = array();
        $params = $this->getRequest()->getParams();
        if ($this->getRequest()->isPost()) {
            if (!empty($params['vendor_id']) && $params['vendor_id'] != "") {
                $vendorSupervisorListQuery = $this->dbAdapter->select()
                ->from("tbl_vendor", array("id","contact_person"))
                ->where("id = ?", $params['vendor_id']);
                $vendorSupervisorListResult = $this->dbAdapter->fetchAll($vendorSupervisorListQuery);
                if ($vendorSupervisorListResult) {
                    $supervisor_options = '<option value="">Please Select</option>';
                    foreach ($vendorSupervisorListResult as $vendor) {
                        $supervisor_options .= '<option value="'.$vendor['id'].'">'.$vendor['contact_person'].'</option>';
                    }
                    $response['flag'] = true;
                    $response['supervisor_list'] = $supervisor_options;
                } else {
                    $response['flag'] = false;
                    $response['title'] = "Data Not Found!";
                    $response['message'] = "Please update vendor details.";
                }
            } else {
               $response['flag'] = false;
               $response['title'] = "Vendor ID Missing!";
               $response['message'] = "Please try again refreshing the page.";   
           }
       } else {
        $response['flag'] = false;
        $response['title'] = "Invalid Request!";
        $response['message'] = "Please try again refreshing the page.";
    }
} catch(Exception $e){
    $response['flag'] = false;
    $response['title'] = "Internal Server Error!";
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
exit;
}


public function deleteVendorAction(){
  $this->checklogin();
  $requestParams = $this->getRequest()->getParams();
  if($requestParams['id']!=''){

   $Data['status']    = '0';

   $where = array();
   $where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['id']);
   $this->dbAdapter->update('tbl_vendor', $Data, $where);
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

public function deleteVendorManpowerAction(){
  $this->checklogin();


  $requestParams = $this->getRequest()->getParams();
        //      echo "<pre>";
        // print_r($requestParams);
        // echo "</pre>";exit;
  if($requestParams['m_id']!=''){

   $Data['status']    = '0';

   $where = array();
   $where[] = $this->dbAdapter->quoteInto('id = ?', $requestParams['m_id']);
   $this->dbAdapter->update('tbl_vendor_manpower', $Data, $where);

}else
{
   $msg= "Deleted Id Missing.";
   $this->view->errorMessage   = $msg;
}
$this->_helper->viewRenderer->setNoRender(true);
$this->_helper->layout()->disableLayout(); 

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
