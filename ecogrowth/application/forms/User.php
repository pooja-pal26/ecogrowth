<?php

class Application_Form_User extends Zend_Form
{
	public function __construct($params = null)
	{
        /************ User Unique Id *****************/
		$unique_login_id = $this->createElement('text','unique_login_id',
		                array('value' => $params['unique_login_id'],
							 'class' => 'input-small',
								'id' => 'unique_login_id'						
							 ))

						->setRequired(true)

						->addDecorators(array(

						'ViewHelper',

						'Errors',

						array('HtmlTag', array('tag' => 'div')),

						array('Label', array('tag' => '')),

						));

		$unique_login_id->addErrorMessage('Unique login id can\'t be empty');
		
		/************ User Name *****************/
		$name = $this->createElement('text','name',
		                array('value' => $params['name'],
							 'class' => 'input-large',
								'id' => 'name'						
							 ))

						->setRequired(true)

						->addDecorators(array(

						'ViewHelper',

						'Errors',

						array('HtmlTag', array('tag' => 'div')),

						array('Label', array('tag' => '')),

						));

		$name->addErrorMessage('Business name can\'t be empty');
		
	    /************ Email address *****************/
		$email = $this->createElement('text','email',
		                array('value' => $params['email'],
							 'class' => 'input-large',
								'id' => 'email'						
							 ))

						->setRequired(true)

						->addFilters(array('StringTrim', 'StripTags'))

						->addValidator('EmailAddress',  TRUE  )

						->addDecorators(array(

						'ViewHelper',

						'Errors',

						array('HtmlTag', array('tag' => 'div')),

						array('Label', array('tag' => '')),

						));

		$email->addErrorMessage('Please enter a valid email address.');

		/************ Age *****************/	
		$age = $this->createElement('select','age',
		               array('value' => $params['age'],
							 'class' => 'input-medium',
								'id' => 'age'						
							 ))

						->setRequired(true)

						->addDecorators(array(

						'ViewHelper',

						'Errors',

						array('HtmlTag', array('tag' => 'div')),

						array('Label', array('tag' => '')),

						));

		$age->addMultiOption('','Select Age');

		for($i=1;$<=100;$i++)
		{
			$age->addMultiOption($i,$i);
		}

		$age->setValue($selected);

		$age->addErrorMessage('Age can\'t be empty');

		$this->addElements(array(
		$unique_login_id,
		$name,
		$email,
		$age
		)); 

	}

}