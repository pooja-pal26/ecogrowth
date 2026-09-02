<?php
class Application_Form_Password extends Zend_Form
{
	public function __construct($params = null)
	{
        
		/************ username  *****************/
        		$old_pass = $this->createElement('password','old_pass',
						array('value' => $params['old_pass'],
							 'class' => 'input-xlarge form-control',
								'id' => 'old_pass'
										
							 ))

						->setRequired(true)
						->setErrorMessages(array('Please enter current password'))
						->addDecorators(
								array(
								'ViewHelper',
								'Errors',
								array('HtmlTag', array('tag' => 'div')),
								array('Label', array('tag' => '')),
							));

		/************ Password *****************/				
		$password = $this->createElement('password','password',
						array('autocomplete' => 'off',
							 'class' => 'input-xlarge form-control',
								'id' => 'password'
								
						))
					->setRequired(true)
					->setErrorMessages(array('Please enter new password'))
					->addDecorators(array(
					'ViewHelper',
					'Errors',
					array('HtmlTag', array('tag' => 'div')),
					array('Label', array('tag' => '')),
					));
		
        	/************ Confirm Password *****************/				
		    $cpassword = $this->createElement('password','cpassword',
						array('autocomplete' => 'off',
							 'class' => 'input-xlarge form-control',
								'id' => 'cpassword'
								
						))
					->setRequired(true)
					->setErrorMessages(array('Please enter confirm password'))
					->addDecorators(array(
					'ViewHelper',
					'Errors',
					array('HtmlTag', array('tag' => 'div')),
					array('Label', array('tag' => '')),
					));

		$this->addElements(array(
		$old_pass,
		$password,
		$cpassword
		)); 
	}
}
