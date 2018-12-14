// <!-- create an array of hours 
//               what is the day and time?
//               look up opening hours for today
//               compare with current time
//               -->





<!DOCTYPE html>
<html><body>
<style>
.disablable{position:relative;overflow:hidden;}
.place-detail-container .not_logged_in .not_logged_in_overlay{display:block;position:absolute;top:0px;bottom:0px;opacity:0.4;filter:alpha(opacity=40);background-color:green;height:expression(parentElement.scrollHeight + 'px');width:100%;}
.place-detail-container .is_logged_in .not_logged_in_overlay{display:none;}</style>



<button onclick="document.getElementById('control').className='disablable disablable-disabled';">Disable</button>
<button onclick="document.getElementById('control').className='disablable disablable-enabled';">Enable</button>

<div id="control" class="disablable disablable-enabled" style="border:1 px solid black;">
<div class="glasspanel"></div>

These are the controls to disable:
<br>
<button>Hi!</button>
<select><option>Option 1</option><option>Option 2</option></select>
</div>
<button>Won't be disabled</button>
</body></html>
