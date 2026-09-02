<?php
class Application_Form_IndexLogin extends Zend_Form
{
	public function __construct($params = null)
	{
		/************ username  *****************/
        		$email = $this->createElement('text','email',
						array('class' => 'form-control',
								'id' => 'email',
								'placeholder' => 'Enter your email address'			
							 ))
                        // ->setValidators(array(array("Alnum", true, array("allowWhiteSpace" => false))))	 
						->setRequired(true)
						->setErrorMessages(array('Please enter email address'))
						->addDecorators(
								array(
								'ViewHelper',
								'Errors',
								array('HtmlTag', array('tag' => 'div','class' => 'error')),
								array('Label', array('tag' => '')),
							));

		/************ Password *****************/				
		$password = $this->createElement('password','password',
						array('class' => 'form-control',
							     'id' => 'password',
								'placeholder' => 'Enter your password'
						))
						
					->setRequired(true)
					//->setValidators(array(array("Alnum", true, array("allowWhiteSpace" => false))))	
					->setErrorMessages(array('Please enter password'))
					->addDecorators(array(
					'ViewHelper',
					'Errors',
					array('HtmlTag', array('tag' => 'div', 'class' => 'error')),
					array('Label', array('tag' => '')),
					));
							//$password->addErrorMessage('Password can not be empty');		
		$this->addElements(array(
		$email,
		$password
		)); 
	}
}