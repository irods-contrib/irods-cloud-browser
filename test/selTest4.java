package seleniumTest;

import java.util.concurrent.TimeUnit;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.safari.SafariDriver;

public class selTest4 {
	
	public static void main(String[] args) throws Exception{
		// ******************
		// * SETUP INITITAL *
		// *     DRIVER     *
		// ******************
		WebDriver driver = new SafariDriver();
						
		driver.get("http://0.0.0.0:8080/irods-cloud-backend/#/login");	
						
						
		driver.manage().window().maximize();
						
		// *********
		// * LOGIN *
		// *********
		WebElement host = driver.findElement(By.cssSelector("input[ng-model='loginVal.host']"));
		host.sendKeys("ec2-52-5-157-86.compute-1.amazonaws.com");
					
		WebElement port = driver.findElement(By.cssSelector("input[ng-model='loginVal.port']"));
		port.sendKeys("1247");
						
		WebElement zone = driver.findElement(By.cssSelector("input[ng-model='loginVal.zone']"));
		zone.sendKeys("tempZone");
					
		WebElement un = driver.findElement(By.cssSelector("input[ng-model='loginVal.userName']"));
		un.sendKeys("rods");
						
		WebElement pass = driver.findElement(By.cssSelector("input[ng-model='loginVal.password']"));
		pass.sendKeys("rods");
						
		WebElement submitLoginButton = driver.findElement(By.tagName("button"));
		submitLoginButton.click();
						
						
		TimeUnit.SECONDS.sleep(3);
						
		String currentURL = driver.getCurrentUrl();		

						
		if(currentURL.equals("http://0.0.0.0:8080/irods-cloud-backend/#/home/My%20Home")){
			System.out.println("SUCCESS login");
		}else{
			System.out.println("FAILURE login");
		}
						
		TimeUnit.SECONDS.sleep(3);
		
		// ****************
		// *  Slide menu  *
		// ****************
		WebElement slideSearch = driver.findElement(By.cssSelector("span[class='side_nav_options']"));
				
		if(slideSearch.getCssValue("opacity").equals("0")){
			WebElement menuExp = driver.findElement(By.className("side_nav_toggle_button"));
			menuExp.click();
			TimeUnit.SECONDS.sleep(1);
			if(!slideSearch.getCssValue("opacity").equals("0")){
				System.out.println("SUCCESS slideMenu");
				menuExp.click();
			}else{
				System.out.println("FAILURE slideMenu");
			}
		}else{
			System.out.println("FAILURE slideMenu");
		}
	}

}
