import { createPlaywrightRouter } from "crawlee";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

/**** Scrapping Autotrader Website ****/
export const router = createPlaywrightRouter();

router.addHandler("DETAIL", async ({ request, page, log, dataset }) => {
  //when in the detail page
  log.debug(`Extracting data: ${request.url}`);

  const urlParts = request.url.split("/");
  const carManufacturer = urlParts[4] || "Not Available";

  //Car Name
  const carNameWithTrim =
    (await page.locator("h1.hero-title").textContent()) || "Not Available";

  const carTrim =
    (await page.locator("span#spec-value-2").textContent()) || "Not Available";

  function getCarName(carNameWithTrim, carTrim) {
    const trimIndex = carNameWithTrim.indexOf(carTrim);

    if (trimIndex !== -1) {
      return carNameWithTrim.substring(0, trimIndex).trim();
    } else {
      return carNameWithTrim;
    }
  }

  const carName = getCarName(carNameWithTrim, carTrim);

  //Car Year
  const pattern = /\b\d{4}\b/;
  const match = carName.match(pattern);
  const carYear = match ? match[0] : "No Year Found";

  //Car Image
  const carImage =
    (await page.locator("img#mainPhotoModalMd").getAttribute("src")) ||
    "Not Available";

  //Car Condition
  const carStatus =
    (await page.locator("span#spec-value-1").textContent()) || "Not Available";

  //Car Body Type
  const carBodyType =
    (await page.locator("span#spec-value-3").textContent()) || "Not Available";

  //Car Engine
  const carEngine =
    (await page.locator("span#spec-value-4").textContent()) || "Not Available";

  //Car DriveTrain
  const carDrive =
    (await page.locator("span#spec-value-7").textContent()) || "Not Available";

  //Car Price
  const carPrice =
    (await page.locator(".pa-current-asking-price").textContent()) ||
    "Not Available";

  //Car Mileage
  const carMileage =
    (await page.locator(".ca-current-mileage").textContent()) ||
    "Not Available";

  //Number of Car Doors
  const carDoors =
    (await page.locator("span#spec-value-12").textContent()) || "Not Available";

  //Car Color
  const carExteriorColor =
    (await page.locator("span#spec-value-9").textContent()) || "Not Available";

  const carInteriorColor =
    (await page.locator("span#spec-value-10").textContent()) || "Not Available";

  //Car Fuel Type
  const carFuelType =
    (await page.locator("span#spec-value-13").textContent()) || "Not Available";

  //Car Transmission
  const carTransmission =
    (await page.locator("span#spec-value-6").textContent()) || "Not Available";

  //Car Description
  const carDescription =
    (await page.locator("div#vdp-collapsible-short-text").textContent()) ||
    "Not Available";

  const results = {
    url: request.url,
    id: uuidv4(),
    carManufacturer,
    carName,
    carYear,
    carImage,
    carStatus,
    carMileage,
    carPrice,
    carBodyType,
    carTrim,
    carEngine,
    carDrive,
    carDoors,
    carExteriorColor,
    carInteriorColor,
    carFuelType,
    carTransmission,
    carDescription,
  };

  log.debug(`Saving data: ${request.url}`);
  // await Dataset.pushData(results);
  await dataset.pushData(results);

  console.log(results);

  /* save results in key_value_stores' folder */
  // await Dataset.exportToCSV("scrapped-data");
  // await Dataset.exportToJSON("scrapped-data");
});

router.addHandler("CATEGORY", async ({ page, enqueueLinks, request, log }) => {
  //when in the bodyType page
  log.debug(`Enqueueing pagination for: ${request.url}`);

  const productSelector = ".dealer-split-wrapper > a";
  const nextPageSelector = "a.last-page-link";

  await page.waitForSelector(productSelector);
  await enqueueLinks({
    selector: productSelector,
    label: "DETAIL",
  });

  const nextButton = await page.$(nextPageSelector);
  if (nextButton) {
    await enqueueLinks({
      selector: nextPageSelector,
      label: "CATEGORY",
    });
  }
});

router.addDefaultHandler(async ({ request, page, enqueueLinks, log }) => {
  log.debug(`Enqueueing categories from page: ${request.url}`);

  const linkableSelector = ".bodyTypeItem";

  await page.waitForSelector(linkableSelector);

  await enqueueLinks({
    selector: linkableSelector,
    label: "CATEGORY",
  });
});
