<?php
class Application_Form_AdminForgot extends Zend_Form
{
	public function __construct($params = null)
	{
        
		/************ Email  *****************/
        		$email = $this->createElement('text','email',
						array('value' => $params['email'],
							 'class' => 'form-control',
								'id' => 'email',
								'placeholder' => 'Enter your email'			
							 ))
						->setRequired(true)
						->setErrorMessages(array('Please enter email'))
						->addDecorators(
								array(
								'ViewHelper',
								'Errors',
								array('HtmlTag', array('tag' => 'div','class' => 'error')),
								array('Label', array('tag' => '')),
							));
	
		$this->addElements(array(
		$email
		)); 
	}
}
