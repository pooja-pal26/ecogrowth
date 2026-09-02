<?php

class Bootstrap extends Zend_Application_Bootstrap_Bootstrap
{
   
   protected function _initViewResource()
    {
        // Initialize view
        //$this->bootstrap('admin');
        //$view = $this->getResource('admin');

        // Set the doctype to XHTML1
       //$this->view->doctype('XHTML1_STRICT');
    }
    
    protected function _initAutoload(){
      date_default_timezone_set('Asia/Kolkata');
    }

	protected function _initRoutes()
	{
		$frontController = Zend_Controller_Front::getInstance();
		$router = $frontController->getRouter();

		// Alias legacy/manage-po links to ManagePoSiteController
		$router->addRoute(
			'manage-po-alias',
			new Zend_Controller_Router_Route(
				'manage-po',
				array('controller' => 'manage-po-site', 'action' => 'po-details')
			)
		);

		$router->addRoute(
			'manage-po-actions',
			new Zend_Controller_Router_Route(
				'manage-po/:action/*',
				array('controller' => 'manage-po-site', 'action' => 'po-details')
			)
		);
	}

}

