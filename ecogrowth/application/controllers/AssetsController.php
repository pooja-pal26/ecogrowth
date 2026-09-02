<?php 
date_default_timezone_set('Asia/Kolkata');



class AssetsController extends Zend_Controller_Action {
  var $dbAdapter;
  public function init() {
    $this->_flashMessenger  = $this->_helper->getHelper('FlashMessenger');
    $this->initView();
    $this->dbAdapter        = Zend_Db_Table::getDefaultAdapter(); 
    $auth                   = Zend_Auth::getInstance();
    $authStorage            = $auth->getStorage();
    $this->id              = $authStorage->read()->id;
  }


  public function assetsTypeAction()
  {
    try {
      $this->checklogin();
      $this->view->messages  = $this->_flashMessenger->getMessages();  
      $assetTypeDetailsQuery = $this->dbAdapter->select()
      ->from("asset_types", array("*"))
      ->where("is_active != 2");
      $this->view->assetsTypeDetails = $assetTypeDetailsResult = $this->dbAdapter->fetchAll($assetTypeDetailsQuery);
    } catch(Exception $e){
      echo $e->getMessage();
      exit;
    }
  }

  public function addAssetTypeAction()
  {
    try {
     $this->checklogin();
     $params = $this->getRequest()->getParams(); 
     if($this->getRequest()->isPost()) {
      if ($params['asset_type'] == "") {
        $params['error'] = "Asset Type Missing ! Please enter asset type.";
        $this->view->params = $params;
      } else { 
        $insertData  = array();                                           
        $insertData['type']    = trim($params['asset_type']); 
        $this->dbAdapter->insert('asset_types', $insertData);
        $this->_flashMessenger->addMessage(array("success"=>"Asset Type has been saved successfully"));
        $this->_redirect('/assets/assets-type');
      }
    }
  } catch(Exception $e){
    echo $e->getMessage();
    exit;
  }
}
public function getAssetTypeAction()
{
  try {
    $params = $this->getRequest()->getParams();
    if ($this->getRequest()->isPost()) {
      $assetTypeDetailQuery = $this->dbAdapter->select()
      ->from("asset_types", array("*"))
      ->where("md5(id) = ?", $params['asset_type_id']);
      $this->view->assetTypeDetail = $assetTypeDetailResult = $this->dbAdapter->fetchRow($assetTypeDetailQuery);
    }
    $this->_helper->layout()->disableLayout();
  } catch(Exception $e){
    echo $e->getMessage();
    exit;
  }
}
public function editAssetTypeAction()
{
  try {
   $this->checklogin();
   $params = $this->getRequest()->getParams();
   if($this->getRequest()->isPost()) {
    $roleData  = array();         
    $roleData['type'] = trim($params['asset_type']);
    $this->dbAdapter->update('asset_types', $roleData,array('md5(id) = ?'=>$params['asset-type-id']));
    $this->_flashMessenger->addMessage(array("success"=>"Asset Type has been updated successfully."));
    $this->_redirect('/assets/assets-type');
  }
} catch(Exception $e){
  echo $e->getMessage();
  exit;
}
}

public function activeDeactiveDeleteAssetTypeAction(){
  try {
    $this->checklogin();
    $response = array();
    $params = $this->getRequest()->getParams();
    if ($this->getRequest()->isPost()) {
      $where['id = ?'] = $params['id']; 
      if ($params['type'] == "deactivate" && $params['id'] != "") {
        $updateData['is_active'] = "0";
        $this->dbAdapter->update("asset_types",$updateData,$where);
        $response['flag'] = true;
        $response['type'] = "Deactivated";
        $response['message'] = "Asset Type has been deactivated successfully.";
      } else if ($params['type'] == "activate" && $params['id'] != "") {
        $updateData['is_active'] = "1";
        $this->dbAdapter->update("asset_types",$updateData,$where);
        $response['flag'] = true;
        $response['type'] = "Activated";
        $response['message'] = "Asset Type has been activated successfully.";
      } else if ($params['type'] == "delete" && $params['id'] != "") {
        $updateData['is_active'] = "2";
        $this->dbAdapter->update("asset_types",$updateData,$where);
        $response['flag'] = true;
        $response['type'] = "Deleted";
        $response['message'] = "Asset Type has been deleted successfully.";
      } else {
        $response['flag'] = false;
        $response['message'] = "Asset Type ID missing. Please try after refreshing the page.";
      }
    }
  } catch(Exception $e) {
    $response['flag'] = false;
    $response['message'] = $e->getMessage();
  }
  echo json_encode($response);
  exit;
}

public function assetAction()
{
  try {
   $this->checklogin();
   $assetDetailsQuery = $this->dbAdapter->select()
   ->from("assets", array("*"))
   ->joinLeft("asset_types","asset_types.id = assets.asset_type_id",array("type"))
   ->where("assets.is_active != 2")
   ->order("is_active desc");
   $this->view->assetDetails = $assetDetailsResult = $this->dbAdapter->fetchAll($assetDetailsQuery);
   $assetTypeDetailsQuery = $this->dbAdapter->select()
   ->from("asset_types", array("*"))
   ->where("is_active = 1");
   $this->view->assetTypeDetails = $assetTypeDetailsResult = $this->dbAdapter->fetchAll($assetTypeDetailsQuery); 
 } catch(Exception $e){
  echo $e->getMessage();
  exit;
}
}

public function addAssetAction()
{
  try {
   $this->checklogin(); 
   $response = array();
   $params = $this->getRequest()->getParams();
   $response['params'] = $params;
   if($this->getRequest()->isPost()) {
    if ($params['asset_code'] == "") {
      $response['flag']     = false;
      $response['title']    = "Asset Code Missing !";
      $response['message']  = "Please enter asset code";
    } else if ($params['asset_type'] == "") {
     $response['flag']     = false;
     $response['title']    = "Asset Type Missing !";
     $response['message']  = "Please select asset type";
   } else if ($params['asset_name'] == "") {
     $response['flag']     = false;
     $response['title']    = "Asset Name Missing !";
     $response['message']  = "Please enter asset name";
   } else if ($params['warranty_date'] == "") {
     $response['flag']     = false;
     $response['title']    = "Warranty Date Missing !";
     $response['message']  = "Please select warrant date";
   } else {
    $checkAssetCodeQuery = "SELECT * FROM assets where code = '".trim($params['asset_code'])."'";
    $checkAssetCodeResult = $this->dbAdapter->fetchRow($checkAssetCodeQuery);
    if($checkAssetCodeResult){
     $response['flag']     = false;
     $response['title']    = "Duplicate Asset Code!";
     $response['message']  = "Entered asset code already exists. Please enter different asset code";
   } else {
    $insertData  = array();    
    $insertData['asset_type_id'] =trim($params['asset_type']);
    $insertData['code'] = trim($params['asset_code']);                                       
    $insertData['name'] = trim($params['asset_name']);
    $insertData['warranty_date'] = $this->dateConverter($params['warranty_date']);
    $this->dbAdapter->insert("assets", $insertData);
    $response['flag']     = true;
    $response['title']    = "Saved Successfully";
    $response['message']  = "Asset has been saved successfully.";
  }
}
} else {
  $response['flag']     = false;
  $response['title']    = "Invalid Request Type!";
  $response['message']  = "Invalid request type. Please try again later.";
}
} catch(Exception $e){
  $response['flag'] = false;
  $response['title'] = "Internal Error";
  $response['message'] = $e->getMessage();
}
echo json_encode($response);
exit;
}
public function getAssetNameAction()
{
  try {
    $params = $this->getRequest()->getParams();
    $assetDetailsQuery = $this->dbAdapter->select()
    ->from("assets","*")
    ->where("md5(id) = ?", $params['asset_id']);
    $this->view->assetDetails = $assetDetailsResult = $this->dbAdapter->fetchRow($assetDetailsQuery);
    $assetTypeDetailsQuery = $this->dbAdapter->select()
    ->from("asset_types", array("*"))
    ->where("is_active = 1");
    $this->view->assetTypeDetails = $assetTypeDetailsResult = $this->dbAdapter->fetchAll($assetTypeDetailsQuery); 
    $this->_helper->layout()->disableLayout();
  } catch(Exception $e){
    echo $e->getMessage();
    exit;
  }
}
public function editAssetAction()
{
  try {
   $this->checklogin(); 
   $response = array();
   $params = $this->getRequest()->getParams();
   $response['params'] = $params;
   if($this->getRequest()->isPost()) {
    if ($params['edit_asset_code'] == "") {
      $response['flag']     = false;
      $response['title']    = "Asset Code Missing !";
      $response['message']  = "Please enter asset code";
    } else if ($params['edit_asset_type'] == "") {
     $response['flag']     = false;
     $response['title']    = "Asset Type Missing !";
     $response['message']  = "Please select asset type";
   } else if ($params['edit_asset_name'] == "") {
     $response['flag']     = false;
     $response['title']    = "Asset Name Missing !";
     $response['message']  = "Please enter asset name";
   } else if ($params['edit_warranty_date'] == "") {
     $response['flag']     = false;
     $response['title']    = "Warranty Date Missing !";
     $response['message']  = "Please select warrant date";
   } else {
    $checkAssetCodeQuery = "SELECT * FROM assets WHERE code = '".$params['edit_asset_code']."' AND md5(id) != '".$params['asset_id']."'";
    $checkAssetCodeResult = $this->dbAdapter->fetchRow($checkAssetCodeQuery);
    if($checkAssetCodeResult){
     $response['flag']     = false;
     $response['title']    = "Duplicate Asset Code!";
     $response['message']  = "Entered asset code already exists. Please enter different asset code";
   } else {
    $insertData  = array();    
    $insertData['asset_type_id'] =trim($params['edit_asset_type']);
    $insertData['code'] = trim($params['edit_asset_code']);                                       
    $insertData['name'] = trim($params['edit_asset_name']);
    $insertData['warranty_date'] = $this->dateConverter($params['edit_warranty_date']);
    $this->dbAdapter->update("assets", $insertData, array("md5(id) = ?"=>$params['asset_id']));
    $response['flag']     = true;
    $response['title']    = "Updated Successfully";
    $response['message']  = "Asset has been updated successfully.";
  }
}
} else {
  $response['flag']     = false;
  $response['title']    = "Invalid Request Type!";
  $response['message']  = "Invalid request type. Please try again later.";
}
} catch(Exception $e){
  $response['flag'] = false;
  $response['title'] = "Internal Error";
  $response['message'] = $e->getMessage();
}
echo json_encode($response);
exit;
}

public function activeDeactiveDeleteAssetAction(){
 try {
  $this->checklogin();
  $response = array();
  $params = $this->getRequest()->getParams();
  if ($this->getRequest()->isPost()) {
    $where['id = ?'] = $params['id']; 
    if ($params['type'] == "deactivate" && $params['id'] != "") {
      $updateData['is_active'] = "0";
      $this->dbAdapter->update("assets",$updateData,$where);
      $response['flag'] = true;
      $response['type'] = "Deactivated";
      $response['message'] = "Asset has been deactivated successfully.";
    } else if ($params['type'] == "activate" && $params['id'] != "") {
      $updateData['is_active'] = "1";
      $this->dbAdapter->update("assets",$updateData,$where);
      $response['flag'] = true;
      $response['type'] = "Activated";
      $response['message'] = "Asset has been activated successfully.";
    } else if ($params['type'] == "delete" && $params['id'] != "") {
      $updateData['is_active'] = "2";
      $this->dbAdapter->update("assets",$updateData,$where);
      $response['flag'] = true;
      $response['type'] = "Deleted";
      $response['message'] = "Asset has been deleted successfully.";
    } else {
      $response['flag'] = false;
      $response['message'] = "Asset ID missing. Please try after refreshing the page.";
    }
  }
} catch(Exception $e) {
  $response['flag'] = false;
  $response['message'] = $e->getMessage();
}
echo json_encode($response);
exit;
}

public function assetAssignmentsAction()
{
  try {
   $this->checklogin();
   $this->view->messages  = $this->_flashMessenger->getMessages();  
   $assetAllocatedDetailsQuery = "SELECT tbl_asset_assignments.*,assets.name,assets.code,tbl_user.name as user_name,tbl_user.id as user_id  FROM tbl_asset_assignments left join tbl_user on tbl_user.id = tbl_asset_assignments.assigned_to left join assets on assets.id = tbl_asset_assignments.asset_id";
   $this->view->assetAllocatedDetails = $assetAllocatedDetailsResult = $this->dbAdapter->fetchAll($assetAllocatedDetailsQuery);
   $userNameQuery = $this->dbAdapter->select()
   ->from("tbl_user",array("id","name"))
   ->where("status = 1");
   $this->view->userDetails = $userNameResult = $this->dbAdapter->fetchAll($userNameQuery);
 } catch(Exception $e){
  echo $e->getMessage();
  exit;
}
}
public function systemAssetsAction()
{
  try {
   $this->checklogin();
   $params                 = $this->view->params = $this->getRequest()->getParams(); 
   $sql_assets = "SELECT system_assets.*,assets.name FROM system_assets left join assets on assets.id = system_assets.asset_id where 1 and system_assets.is_active = '1' " ;
   $this->view->system_assets = $this->dbAdapter->fetchAll($sql_assets);
   $this->_helper->layout()->disableLayout();
 } catch(Exception $e){
  echo $e->getMessage();
  exit;
}
}
public function getAssetsByAssetTypeAction()
{
  try {
    $this->checklogin();
    $response = array();
    $params = $this->getRequest()->getParams();
    $assetsListQuery = $this->dbAdapter->select()
    ->from("assets", array("id","name","code"))
    ->where("asset_type_id = ?", $params['asset_type_id'])
    ->where("is_active = 1");
    $assetsListResult = $this->dbAdapter->fetchAll($assetsListQuery);
    $asset_name = '<option value="">Select Asset</option>';
    foreach ($assetsListResult as $assetsList) {
      $asset_name .= '<option value="'.$assetsList['id'].'">'.$assetsList['name'].'</option>';
    }
    $response['flag'] = true;
    $response['asset_name'] = $asset_name;
  } catch(Exception $e){
    $response['flag'] = flase;
    $response['message'] = $e->getMessage();
  }
  echo json_encode($response);
  exit;
}
public function assignAssetAction()
{
 try{
  $this->checklogin();
  $params = $this->getRequest()->getParams();
  $userModel = new Application_Model_User();
  $this->view->userDetails = $userModel->getAllUserIdAndName();
  $assetTypeListQuery = $this->dbAdapter->select()
  ->from("asset_types", array("id","type"))
  ->where("is_active = 1");
  $this->view->assetTypeList = $assetTypeListResult = $this->dbAdapter->fetchAll($assetTypeListQuery);
  $insertSystemData = array();                                           
  if($this->getRequest()->isPost()) {

    // echo "<pre>";
    // print_r($params);
    // exit;
    $i = 0;
    foreach ($params['asset_type'] as $key => $value) {

      $insertData['asset_id']           = $params['asset_id'][$i]; 
      $insertData['assigned_to']    = $params['assigned_to'][$i];
      $insertData['assigned_by']    = $this->id;
      $insertData['assign_date']    = date('Y-m-d H:i:s');
      $this->dbAdapter->insert('tbl_asset_assignments', $insertData);

      if($params['assigned_to'][$i] != ""){
       $notification  = array();
       $notification['from_id'] = $this->id;
       $notification['to_id'] = $params['assigned_to'];
       $notification['message'] = "Asset ".$params['asset_id'][$i]." assigned to ".$this->getUsernameByid($params['assigned_to'][$i]) ;
       $this->dbAdapter->insert('tbl_notification',$notification);
     }


     $i++;
   }

   $this->_flashMessenger->addMessage(array("success"=>"Assets assigned successfully"));
   $this->_redirect('/assets/asset-assignments');
 }
}catch(Exception $e){
  echo $e->getMessage();exit;
}
}

public function viewSystemAssetDetailsAction()
{
  try {
    $this->checklogin();
    $params = $this->getRequest()->getParams();
    $getSystemAssetDetailsQuery = $this->dbAdapter->select()
    ->from("assets as tsa", array("*"))
    ->joinLeft("asset_types","asset_types.id = tsa.asset_type_id", array("asset_types.type"))
    ->joinLeft("assets","assets.id = tsa.asset_name_id", array("assets.name","assets.code"))
    ->where("tsa.system_id = ?", $params['system_id']);
    $this->view->systemAssetDetails = $getSystemAssetDetailsResult = $this->dbAdapter->fetchAll($getSystemAssetDetailsQuery);
    $this->_helper->layout()->disableLayout();
  } catch(Exception $e){
    echo $e->getMessage();
    exit;
  }
}

public function removeAssignedSystemAssetsAction()
{
  try {
    $this->checklogin();
    $response = array();
    $params = $this->getRequest()->getParams();
    $updateData = array();
    if ($params['system_asset_id'] != "") {
      $updateData['is_active'] = "0";
      $where['id = ?'] = $params['system_asset_id'];
      $this->dbAdapter->update("assets", $updateData, $where);
      $assetIdQuery = $this->dbAdapter->select()
      ->from("assets", array("asset_name"))
      ->where("id = ?", $params['system_asset_id']);
      $assetIdResult = $this->dbAdapter->fetchRow($assetIdQuery);
      $updateAsset['is_allocated'] = "0";
      $this->dbAdapter->update("assets", $updateAsset, array("id = ?"=>$assetIdResult['asset_name']));
      $response['flag'] = true;
      $response['message'] = "Asset has been removed successfully.";
    } else {
      $response['flag'] = false;
      $response['message'] = "Asset ID not found. Please try agian later.";
    }
  } catch(Exception $e){
    $response['flag'] = false;
    $response['message'] = $e->getMessage();
  }
  echo json_encode($response);
  exit;
}

public function editSystemAction()
{
  try {
   $this->checklogin();
   $this->view->messages  = $this->_flashMessenger->getMessages();
   $params = $this->getRequest()->getParams();
   $userModel = new Application_Model_User();
   $this->view->userDetails = $userModel->getAllUserIdAndName();
   $systemDetailsQuery = $this->dbAdapter->select()
   ->from("tbl_system", array("*"))
   ->where("md5(id) = ?", $params['system-id']);
   $this->view->systemDetails = $systemDetailsResult = $this->dbAdapter->fetchRow($systemDetailsQuery);
   $systemAssetDetailsQuery = $this->dbAdapter->select()
   ->from("assets as tsa", array("*"))
   ->joinLeft("asset_types as at","at.id = tsa.asset_type_id",array("at.type"))
   ->joinLeft("assets","assets.id = tsa.asset_name_id",array("assets.name","assets.code"))
   ->where("md5(tsa.system_id) = ?", $params['system-id'])
   ->where("tsa.is_active = 1");
   $this->view->systemAssetDetails = $systemAssetDetailsResult = $this->dbAdapter->fetchAll($systemAssetDetailsQuery);
   $assetTypeListQuery = $this->dbAdapter->select()
   ->from("asset_types", array("id","type"))
   ->where("is_active = 1");
   $this->view->assetTypeList = $assetTypeListResult = $this->dbAdapter->fetchAll($assetTypeListQuery);
   $assetListQuery = $this->dbAdapter->select()
   ->from("assets", array("*"))
   ->where("is_active = 1");
   $this->view->assetList = $assetListResult = $this->dbAdapter->fetchAll($assetListQuery);
   if($this->getRequest()->isPost()) {
    $updateSystemData = array();                                           
    $updateSystemData['name']           = trim($params['system_name']); 
    $updateSystemData['code']           = trim($params['system_code']); 
    $updateSystemData['assigned_to']    = trim($params['assigned_to']);
    $updateSystemData['assigned_by']    = $this->id;
    $this->dbAdapter->update('tbl_system', $updateSystemData, array("md5(id) = ?"=>$params['system-id']));
    $i = 0;
    foreach ($params['asset_type'] as $key => $value) {
     $systemDetailsData = array();
     $systemDetailsData['system_id']  = $systemDetailsResult['id'];
     $systemDetailsData['asset_type'] = $value;
     $systemDetailsData['asset_name'] = $params['asset_name'][$i];
     $systemDetailsData['asset_code'] = $params['asset_code'][$i];
     $this->dbAdapter->insert('assets', $systemDetailsData);
     $updateAsset['is_allocated'] = "1";
     $whereData['id = ?'] = $params['asset_name'][$i];
     $this->dbAdapter->update("assets", $updateAsset, $whereData);
     $i++;
   }
   if($params['assigned_to'] != ""){
     $Data  = array();
     $Data['from_id'] = $this->id;
     $Data['to_id'] = $params['assigned_to'];
     $Data['message'] = $this->getUsernameByid($this->id)." updated your assigned system '".$params['system_name']."'" ;
     $this->dbAdapter->insert('tbl_notification',$Data);
   }
   $assignedToName = $this->getUsernameByid($params['assigned_to']);
   $this->_flashMessenger->addMessage(array("success"=>ucwords(strtolower($assignedToName))."'s system has been updated successfully."));
   $this->_redirect('/assets/system');
 }
} catch(Exception $e){
  echo $e->getMessage();
  exit;
}
}

public function activeDeactiveDeleteSystemAction()
{
  try {
    $this->checklogin();
    $response = array();
    $params = $this->getRequest()->getParams();
    $updateData = array();
    if ($this->getRequest()->isPost()) {
      if ($params['type'] == "deactivate") {
        $updateData['is_active'] = "0";
        $where["id = ?"] = $params['id'];
        $this->dbAdapter->update("tbl_system", $updateData, $where);
        $response['flag'] = true;
        $response['title'] = "Deactivated Successfully";
        $response['message'] = "System has been deactivated successfully.";
      } else if ($params['type'] == "activate") {
        $updateData['is_active'] = "1";
        $where["id = ?"] = $params['id'];
        $this->dbAdapter->update("tbl_system", $updateData, $where);
        $response['flag'] = true;
        $response['title'] = "Activated Successfully";
        $response['message'] = "System has been activated successfully.";
      } else if ($params['type'] == "delete") {
        $updateData['is_active'] = "2";
        $where["id = ?"] = $params['id'];
        $this->dbAdapter->update("tbl_system", $updateData, $where);
        $getAssetNameIdQuery = $this->dbAdapter->select()
        ->from("assets", array("asset_name"))
        ->where("system_id = ?", $params['id'])
        ->where("is_active = 1");
        $getAssetNameIdResult = $this->dbAdapter->fetchAll($getAssetNameIdQuery);
        $this->dbAdapter->update("assets", $updateData, array("system_id = ?"=>$params['id']));
        foreach ($getAssetNameIdResult as $assetId) {
          $this->dbAdapter->update("assets", array("is_allocated"=>"0"), array("id = ?"=>$assetId['asset_name']));
        }
        $response['flag'] = true;
        $response['title'] = "Deleted Successfully";
        $response['message'] = "System has been deleted successfully.";
      }
    } else {
      $response['flag'] = false;
      $response['message'] = "Invalid Request Type. Please try again later.";
    }
  } catch(Exception $e){
    $response['flag'] = false;
    $response['message'] = $e->getMessage();
  }
  echo json_encode($response);
  exit;
}
public function getUsernameByid($id){
 try{
  $sql = "select name from tbl_user where id =".$id;
  $user = $this->dbAdapter->fetchRow($sql);
  return $user['name'];
}catch(Exception $e){
  echo $e->getMessage();exit;
}
}
public function dateConverter($date)
{
 $date1 = str_replace('/', '-', $date);
 $date2 = new DateTime($date1);
 $date3 = $date2->format('Y-m-d');
 return $date3;
}
public function checklogin(){   
 $auth           = Zend_Auth::getInstance(); 
 $errorMessage   = ""; 
 /*************** check user identity ************/
 if(!$auth->hasIdentity()){
  $this->_redirect('/admin/index');  
}   
}

public function returnDeviceAction(){
  try {
   $this->checklogin();
   $response =array();
   $this->view->messages  = $this->_flashMessenger->getMessages(); 

   $params = $this->getRequest()->getParams(); 
   $updateArray =array();
   $updateArray['return_date'] = date('Y-m-d H:i:s');
   $where["id = ?"] = $params['id'];
   $this->dbAdapter->update("tbl_asset_assignments",$updateArray,$where);

   $response['flag'] = true;
   $response['title'] = "Device Returned Successfully";
   $response['message'] = "Asset has been returned successfully.";
 }catch(Exception $e){
  echo $e->getMessage();
  exit;
} 
echo json_encode($response);
exit;
}
}

?>