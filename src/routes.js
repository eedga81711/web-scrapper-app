import { createPlaywrightRouter, Dataset } from "crawlee";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

/**** Scrapping Autotrader Website ****/
export const router = createPlaywrightRouter();

router.addHandler("DETAIL", async ({ request, page, log }) => {
  //when in the detail page
  log.debug(`Extracting data: ${request.url}`);

  const urlParts = request.url.split("/");
  const carManufacturer = urlParts[4] || "Not Available";

  const carName =
    (await page.locator("h1.hero-title").textContent()) || "Not Available";

  const pattern = /\b\d{4}\b/;

  const match = carName.match(pattern);
  const carYear = match ? match[0] : "No Year Found";

  const carImage =
    (await page.locator("img#mainPhotoModalMd").getAttribute("src")) ||
    "Not Available";

  const carStatus =
    (await page.locator("span#spec-value-1").textContent()) || "Not Available";

  const carBodyType =
    (await page.locator("span#spec-value-3").textContent()) || "Not Available";

  const carTrim =
    (await page.locator("span#spec-value-2").textContent()) || "Not Available";

  const carEngine =
    (await page.locator("span#spec-value-4").textContent()) || "Not Available";

  const carDrive =
    (await page.locator("span#spec-value-7").textContent()) || "Not Available";

  const carPrice =
    (await page.locator(".pa-current-asking-price").textContent()) ||
    "Not Available";

  const carMileage =
    (await page.locator(".ca-current-mileage").textContent()) ||
    "Not Available";

  const carDoors =
    (await page.locator("span#spec-value-12").textContent()) || "Not Available";

  const carExteriorColor =
    (await page.locator("span#spec-value-9").textContent()) || "Not Available";

  const carInteriorColor =
    (await page.locator("span#spec-value-10").textContent()) || "Not Available";

  const carFuelType =
    (await page.locator("span#spec-value-13").textContent()) || "Not Available";

  const carTransmission =
    (await page.locator("span#spec-value-6").textContent()) || "Not Available"; //should be 6 even in apify

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
  await Dataset.pushData(results);

  console.log(results);
  await Dataset.exportToCSV("scrapped-data");
  await Dataset.exportToJSON("scrapped-data");

  /* save results in key_value_stores' folder */
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
