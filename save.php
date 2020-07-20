<?php



if(isset($_POST['spokentext']) && !empty($_POST['spokentext'])){
    
$c = $_POST['video-filename'] . date('m-d-Y-h-i-s-a', time());    
$content = $_POST['spokentext'];
$fp = fopen("uploads/".$c.".txt","wb");
fwrite($fp,$content);
fclose($fp);
}


$filePath = 'uploads/' . $_POST['video-filename'];

// path to ~/tmp directory
$tempName = $_FILES['video-blob']['tmp_name'];

// move file from ~/tmp to "uploads" directory
if (!move_uploaded_file($tempName, $filePath)) {
    // failure report
    echo 'Problem saving file: '.$tempName;
    die();
}

// success report
echo 'success';



?>