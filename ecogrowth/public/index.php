<?php
 date_default_timezone_set('India/Kolkata');

// Define path to application directory

defined('APPLICATION_PATH')

    || define('APPLICATION_PATH', realpath(dirname(__FILE__) . '/../application'));



// Define application environment

defined('APPLICATION_ENV')

    || define('APPLICATION_ENV', (getenv('APPLICATION_ENV') ? getenv('APPLICATION_ENV') : 'production'));



// Ensure library/ is on include_path

set_include_path(implode(PATH_SEPARATOR, array(

    realpath(APPLICATION_PATH . '/../library'),

    get_include_path(),

)));	



$lib_path = "../";

require_once $lib_path."library/Zend/Loader/Autoloader.php";

$autoloader = Zend_Loader_Autoloader::getInstance();

$autoloader->setFallbackAutoloader(true);







/** Zend_Application */

require_once $lib_path.'library/Zend/Application.php';

// Create application, bootstrap, and run

$application = new Zend_Application(

    APPLICATION_ENV,

    APPLICATION_PATH . '/configs/application.ini'

);









$application->bootstrap()

            ->run();



?>

