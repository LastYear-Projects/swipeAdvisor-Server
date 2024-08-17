const axios =require('axios');
const cheerio =require('cheerio');

// Function to check if the text contains cashback-related keywords
let cashbackItems = [];
function containsCashbackKeywords(text) {
  const keywords = ['קאשבק', 'קאשבאק', 'כסף בחזרה', 'החזר כספי'];
  return keywords.some((keyword) => text.includes(keyword));
}

// Function to construct absolute URL from base URL and relative URL
function resolveUrl(baseUrl, relativeUrl) {
  if (!relativeUrl) return null;
  // Remove any trailing slashes from base URL and leading slashes from relative URL
  baseUrl = baseUrl.replace(/\/+$/, '');
  relativeUrl = relativeUrl.replace(/^\/+/, '');
  // Combine base URL and relative URL
  return `${baseUrl}/${relativeUrl}`;
}

// Function to extract numerical value from text
function extractNumber(text) {
  const match = text.match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

// Function to reorder bidirectional text manually
function reOrderBidiText(text) {
  // Check if the entire text is in Hebrew
  if (/^[\u0590-\u05FF\s]+$/.test(text)) {
    // Reverse the entire string
    return text.split(' ').reverse().join(' ');
  }

  // If the text contains mixed languages, handle each segment separately
  return text
      .split(' ')
      .map((segment) => {
        // Reverse only the segments that are entirely in Hebrew
        if (/^[\u0590-\u05FF]+$/.test(segment)) {
          return segment.split('').reverse().join('');
        }
        // Return other segments (like numbers) as they are
        return segment;
      })
      .join(' ');
}

function getFirstWord(text) {
  // Trim any extra spaces
  text = text.trim();

  // Define the regular expression to match common delimiters
  const delimiterPattern = /[ \-_.,;:|!]/;

  // Split the text by the defined delimiters and return the first part
  return text.split(delimiterPattern)[0].trim();
}

// Function to scrape data
// async function scrapeWebsiteIsracrd(url) {
//   try {
//     // Step 1: Make a request to the website
//     const { data } = await axios.get(url);
//
//     // Step 2: Load the HTML into cheerio
//     const $ = cheerio.load(data);
//     const baseUrl = new URL(url).origin;
//
//
//
//     $('.category-item').each((index, element) => {
//       const title = $(element).find('.caption-title').text().trim();
//       const subTitle = $(element).find('.caption-sub-title').text().trim();
//       const firstWordOfSubTitle = getFirstWord(subTitle);
//       const backgroundImage = $(element)
//           .find('.category-featured-benefit')
//           .css('background-image');
//
//       // Only include items with cashback-related keywords
//       if (
//           containsCashbackKeywords(title) ||
//           containsCashbackKeywords(firstWordOfSubTitle)
//       ) {
//         cashbackItems.push({
//           title: reOrderBidiText(title),
//           subTitle: firstWordOfSubTitle,
//           backgroundImage,
//         });
//       }
//     });
//
//     if (cashbackItems.length === 0) {
//       console.warn('No cashback items found.');
//     }
//
//     // Step 4: Fetch details for each cashback item
//     for (const item of cashbackItems) {
//       if (item.detailUrl) {
//         try {
//           const detailData = await axios.get(item.detailUrl);
//           const $detail = cheerio.load(detailData.data);
//
//           const cashbackTitle = $detail('.cashBack-title').text().trim();
//           const cashbackDescription = $detail('.cashBack-description').text().trim();
//           const dedicatedCoupon = $detail('.dedicate-coupon-block-store-coupon').text().trim();
//
//           item.cashbackDetails = {
//             title: reOrderBidiText(cashbackTitle),
//             description: reOrderBidiText(cashbackDescription),
//             dedicatedCoupon: reOrderBidiText(dedicatedCoupon),
//           };
//         } catch (detailError) {
//           console.error(`Error fetching details for item ${item.title}:`, detailError);
//         }
//       }
//     }
//
//     // Step 5: Print the extracted data
//     pipeToSwipeAdvisor(cashbackItems,'6658b688892bce96bd5d588f');
//   } catch (error) {
//     console.error(`Error scraping the website ${url}:`, error);
//     if (retries > 0) {
//       console.warn(`Retrying ${url} (${retries} retries left)...`);
//       await scrapeWebsiteIsracrd(url, retries - 1);
//     } else {
//       console.error(`Error scraping the website ${url}:`, error);
//     }
//   }
// }
// async function loginToWebsite(loginUrl) {
//   const credentials = {
//     username: '311238356', // Replace with your username
//     password: '311238356', // Replace with your password
//   };
//
//   try {
//     const response = await axios.post(loginUrl, credentials, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//
//     const cookies = response.headers['set-cookie'];
//     return cookies;
//
//   } catch (error) {
//     console.error('Login failed:', error);
//     throw error;
//   }
// }

export async function scrapeWebSiteHever() {
  const cashBacks= [];
  const url= 'https://www.cashback-hvr.co.il/category/travel?mid=269341&sig=f8d7e3d24bccb99dfcafb5ddd354c202';
  // const cookies= await loginToWebsite(url);

  const creditCardId = '66bb7766995330bf77f4ccb2';
  try {
    const { data } = await axios.get(url);
    // const { data } = await axios.get(url, {
    //   headers: {
    //     'Cookie': cookies.join('; '), // Pass the session cookies in the request
    //   },
    // });
    const $ = cheerio.load(data);
    const baseUrl = new URL(url).origin;

    $('.retailer_preview ').each((index, element) => {
      const title = $(element).find('.tete.ellipsis').text().trim();
      const subTitle = $(element).find('.slider h4 ').text().trim();
      const imageUrl = $(element).find('.preview_logo').attr('data-src');
      const backgroundImage = resolveUrl(baseUrl, imageUrl);

      if (containsCashbackKeywords(subTitle)) {
        cashBacks.push({
          businessName: reOrderBidiText(title),
          businessSubTitle: reOrderBidiText(subTitle),
          creditCardId: creditCardId,
          discountType: 'cashback',
          valueType: subTitle.includes('%') ? 'percentage' : 'number',
          value: extractNumber(subTitle),
          businessImage: backgroundImage,
        });
      }
    });
    console.log(cashBacks[0]);
    return cashBacks;

  } catch (error) {
    console.error(`Error scraping the website ${url}:`, error);
  }

}
module.exports ={scrapeWebSiteHever};

// const pipeToSwipeAdvisor = (data, creditCardId) => {
//   return data.map((benefit) => {
//     const newBenefit = {
//       businessName: reOrderBidiText(benefit.title),
//       businessSubTitle: reOrderBidiText(benefit.subTitle),
//       creditCardId: creditCardId,
//       discountType: 'cashback',
//       valueType: benefit.subTitle.includes('%') ? 'percentage' : 'number',
//       value: extractNumber(benefit.subTitle),
//       businessImage: benefit.backgroundImage,
//     };
//
//     // Print each newBenefit object
//     console.log(newBenefit);
//
//     return newBenefit;
//   });
// };


// scrapeWebsiteIsracrd('https://benefits.isracard.co.il/parentcategories/online-benefits/');
// const cashBackHever = scrapeWebSiteHever();







