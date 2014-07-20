<?php
	if(isset($_POST) && !empty($_POST)){
	//if(isset($_POST)){
		//$_POST['name'] = "file";
//		$date = (string)date("Y-m-d h:i:sa");
		$strDate = $_POST['date'];
		$strDate = str_replace(" ","_",$strDate);
		$strDate = str_replace(":","_",$strDate);	//':' is NOT a valid character for a filename. So replace it
//		$myFile = $_POST['name'].$strDate.".csv";
                $myFile = $_POST['name']."_".$strDate.".csv";  //jedi-code
		$fh = fopen($myFile, 'w') or die("can't open file");
		$stringData = $_POST['payload'];
		fwrite($fh, $stringData);
		fclose($fh);
		//header("location:$myFile");
		//header('Content-Type: application/csv');
		/*header('Content-Type: application/octet-stream');
		header("Content-Disposition: attachment; filename=$myFile");
		header('Content-Length: ' . filesize($myFile));
		header('Pragma: no-cache');
		readfile("$myFile");
		print file_get_contents($myFile);
		//return (string)$myFile;*/
		echo (string)$myFile;
	}
?>