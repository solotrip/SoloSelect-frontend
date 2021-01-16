import ReactDOM from "react-dom";
import React, { Fragment, useEffect, useState } from "react";
import "./style.css";
import { createApi } from "unsplash-js";

import Select from "react-select";

import S3FileUpload from "react-s3";

import download from "downloadjs";

import base64js from "base64-js";
import Path from "path";

import cityNames from "./citynames.json";

import cityOptions from "./cityoptions.json";

import axios from "axios";

let photoCount = 0;
let a;

let cityCount = 0;
const api = createApi({
  // Don't forget to set your access token here!
  // See https://unsplash.com/developers
  //accessKey: "Dypv6rvXkdydlkGSZB0NMzZsCcPrfuYPAE9aJZAcxoI",
  accessKey: "MdjRLoLPi7PEBXEOm_u_ZnidNmNgClBlSHq7ImRmD7E",
});

const orientationOptions = [
  {
    key: "landscape",
    text: "landscape",
    value: "landscrape",
  },
  {
    key: "portrait",
    text: "portrait",
    value: "portrait",
  },
  {
    key: "squarish",
    text: "squarish",
    value: "squarish",
  },
];

const PhotoComp = ({ photo, selectedImages, onchange }) => {
  const { user, urls, width, height } = photo;

  const [checkd, setCheckd] = useState(false);

  const handleChange = (event) => {
    //let arr = [];
    // arr.push(photo.id);
    if (!checkd) {
      console.log("selected");
      console.log("selected photo url is: ", photo.urls.regular);
      //Add to selecteds.
      onchange({ type: "add", content: photo });
      setCheckd(true);
    } else {
      console.log("canceled");
      //Remove from selecteds.
      onchange({ type: "remove", content: photo });
      setCheckd(false);
    }
  };

  return (
    <Fragment>
      <input
        className="checkbox"
        name="isGoing"
        type="checkbox"
        size={100}
        checked={checkd}
        onChange={handleChange}
      />
      <img className="img" src={urls.regular} />
      <a
        className="credit"
        target="_blank"
        href={`https://unsplash.com/@${user.username}`}
      >
        {user.name}
      </a>

      <br />
      <div>
        width: {width} and height: {height}
        <br />
        photoId: {photo.id}
        <br />
      </div>
    </Fragment>
  );
};

const Body = () => {
  let allPages = 1;
  let allResults = [];
  let i = 1;
  let arr = [];

  const [data, setPhotosResponse] = useState(null);
  const [query, setQuery] = useState("");
  const [orientation, setOrientation] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(2);
  const [selectedImagesCount, setSelectedImagesCount] = useState(0);
  const [selecteds, setSelecteds] = useState([]);
  const [city, setCity] = useState("mexico-city-mexico_Q1489");
  const [imageMode, setImageMode] = useState("city-card");
  const [serverImages, setServerImages] = useState(null);
  const [wkdArray, setWkdArray] = useState(null);

  const onchange = (data) => {
    //arr.push(data);
    if (!selecteds.includes(data)) {
      if (data.type === "add") {
        setSelecteds((oldArray) => [...oldArray, data]);
      } else if (data.type === "remove") {
        setSelecteds((oldArray) =>
          oldArray.filter((item) => item.content !== data.content)
        );
      }
    }
  };

  function pushToItemCounter(array) {
    var obj = [];
    array.forEach(function (val) {
      if (!obj[val])
        // create new property if property is not found
        obj[val["wkd_id"]] = 1;
      // increment matched property by 1
      else obj[val["wkd_id"]]++;
    });
    console.log("object is:", obj);
  }

  async function getFromBackend() {
    const photos = await axios.get("http://localhost:5001/photos");
    //console.log("photos count: ", photos.data);
    return photos.data;
  }

  async function sendToBackend(
    id,
    name,
    key,
    value,
    type,
    city,
    width,
    height,
    content
  ) {
    await axios.post("http://localhost:5001/photos", {
      id: id,
      name: name,
      key: key,
      value: value,
      type: type,
      city: city,
      width: width,
      height: height,
      content: content,
    });
  }

  const getImages = () => {
    let images = [];
    setTimeout(() => {
      getFromBackend().then((x) => {
        console.log("x is ", x);
        setServerImages(x);

        return x;
      });
    }, 100);
  };

  const uploadFile = () => {
    selecteds.forEach((selected) => {
      let fileName;
      //download to local.
      //selected.content.urls.regular
      console.log("uploading...");
      setTimeout(() => {
        const response = {
          file: selected.content.urls.regular,
        };

        //window.open(response.file);

        fetch(response.file)
          .then((response) => {
            console.log("hopefully fetching image");
            return response.blob();
          })
          .then((blob) => {
            console.log("image data blob is", blob);
            fileName = city + "_" + imageMode + "_" + selected.content.id;
            var file = new File(
              [blob],
              city + "_" + imageMode + "_" + selected.content.id
            );
            S3FileUpload.uploadFile(file, {
              bucketName: "soloselect",
              region: "eu-central-1",
              accessKeyId: "AKIAJNXJ25NNWLXKAZQA",
              secretAccessKey: "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",
            });

            //send to backend.
            sendToBackend(
              selected.content.id,
              fileName,
              fileName,
              `https://soloselect.s3.eu-central-1.amazonaws.com/${fileName}`,
              imageMode,
              city,
              selected.content.width,
              selected.content.height,
              selected.content
            );
          });
      }, 100);
    });
    alert("images uploaded successfully!");
  };

  //new uploadFile

  const selectedImages = [];

  const searchPhotos = async (e, page, orientation) => {
    e.preventDefault();

    if (orientation === "all") {
      api.search
        .getPhotos({
          query: query,
          page: page,
          perPage: 30,
        })
        .then((result) => {
          setMaxPage(result.response.total_pages);
          const all = allResults.concat(result.response.results);
          setPhotosResponse(all);
          console.log("results :", result.response.results[0].urls.raw);
        })
        .catch((err) => {
          console.log("something went wrong!", err);
        });
    } else {
      //for (const i = 1; i <= allPages; i++) {
      api.search
        .getPhotos({
          query: query,
          page: page,
          perPage: 30,
          orientation: orientation,
        })
        .then((result) => {
          setMaxPage(result.response.total_pages);
          const all = allResults.concat(result.response.results);
          setPhotosResponse(all);
        })
        .catch(() => {
          console.log("something went wrong!");
        });
      //}
    }
  };

  const searchPhotosv2 = async (e, page, orientation) => {
    e.preventDefault();
    if (orientation == "all") {
      fetch(
        `https://api.unsplash.com/search/photos?query=${query}&page=${page}&per_page=30&client_id=MdjRLoLPi7PEBXEOm_u_ZnidNmNgClBlSHq7ImRmD7E`
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log("data is below:");
          console.log(("data:", data));
          console.log("max page: ", data.total_pages);
          setMaxPage(data.total_pages);
          const all = allResults.concat(data.results);
          setPhotosResponse(all);
        });
    } else {
      fetch(
        `https://api.unsplash.com/search/photos?query=${query}&page=${page}&orientation=${orientation}&per_page=30&client_id=MdjRLoLPi7PEBXEOm_u_ZnidNmNgClBlSHq7ImRmD7E`
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log("data is below:");
          console.log(("data:", data));
          console.log("max page: ", data.total_pages);
          setMaxPage(data.total_pages);
          const all = allResults.concat(data.results);
          setPhotosResponse(all);
        });
    }
  };

  const handleSelectedChange = () => {};

  let objHolder = {};

  let objcount = 0;

  useEffect(() => {
    api.search
      .getPhotos({ query: query, perPage: 30 })
      .then((result) => {
        setPhotosResponse(result.response.results);
        console.log("result is ", result);
        console.log("total pages are y ", result.response.total_pages);
      })
      .catch(() => {
        console.log("something went wrong!");
      });
  }, []);

  if (data === null) {
    return <div>Loading...</div>;
  } else if (data.errors) {
    return (
      <div>
        <div>{data.errors[0]}</div>
        <div>PS: Make sure to set your access token!</div>
      </div>
    );
  } else {
    return (
      <>
        <div className="colHolder">
          <div className="leftCol">
            <form
              className="form"
              onSubmit={(e) => searchPhotosv2(e, currentPage, orientation)}
            >
              <label className="label" htmlFor="query">
                SoloSelect 📷
              </label>
              <input
                type="text"
                name="query"
                className="input"
                placeholder={`Try "Oslo" or "sky"`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
              >
                <option value="all">All</option>
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
                <option value="squarish">Squarish</option>
              </select>
              <button type="submit" className="button">
                Search
              </button>
              {/*<Dropdown
            selection
            fluid
            options={orientationOptions}
            placeholder="Choose an orientation option"
          />*/}
            </form>
            <button
              onClick={(e) => {
                if (currentPage > 0) {
                  setCurrentPage(currentPage - 1);
                  searchPhotosv2(e, currentPage - 1, orientation);
                }
              }}
            >
              Previous Page
            </button>
            Page {currentPage} of {maxPage}
            <button
              onClick={(e) => {
                if (currentPage < maxPage) {
                  setCurrentPage(currentPage + 1);
                  searchPhotosv2(e, currentPage + 1, orientation);
                }
              }}
            >
              Next Page
            </button>
            <div className="feed">
              <ul className="columnUl">
                {data.map((photo) => (
                  <li key={photo.id} className="li">
                    <PhotoComp
                      photo={photo}
                      width={photo.width}
                      height={photo.height}
                      index={photoCount}
                      photoId={photo.id}
                      selectedImages={selectedImages}
                      onchange={(e) => {
                        onchange(e);
                        console.log("at child: ", selecteds);
                      }}
                      data={selecteds}
                    />
                    {/*(photoCount = photoCount + 1)*/}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={(e) => {
                if (currentPage > 0) {
                  setCurrentPage(currentPage - 1);
                  searchPhotosv2(e, currentPage - 1, orientation);
                }
              }}
            >
              Previous Page
            </button>
            Page {currentPage} of {maxPage}
            <button
              onClick={(e) => {
                if (currentPage < maxPage) {
                  setCurrentPage(currentPage + 1);
                  searchPhotosv2(e, currentPage + 1, orientation);
                }
              }}
            >
              Next Page
            </button>
          </div>
          <div className="rightCol">
            <div className="selectedImages">
              Selected Images:{selectedImages}
            </div>
            <br />
            Which city to upload?
            {/*
          <select
            className="selector"
            onChange={(e) => {
              setCity(e.target.value);
              console.log("city changed to:", city);
            }}
          >
            {Object.keys(cityNames).map((city, k) => (
              <option value={cityNames[city]["name"]}>
                {cityNames[city]["name"]}
              </option>
            ))}
          </select>
          */}
            <Select
              value={city}
              onChange={(e) => {
                setCity(e.label);
                console.log("e is ", e.label);
                console.log("city changed to:", city);
              }}
              isSearchable={true}
              options={cityOptions}
            />
            <br />
            <br />
            As a City Card or Gallery(Carousel) ?
            <select
              className="selector2"
              value={imageMode}
              onChange={(e) => setImageMode(e.target.value)}
            >
              <option value="city-card">City Card</option>
              <option value="gallery">Gallery</option>
            </select>
            <br />
            <button className="uploadButton" onClick={uploadFile}>
              Upload Selected Images
            </button>{" "}
          </div>
        </div>
        <div className="count-section">
          City Ids with Number of Photos
          <div className="to-do">
            <button className="uploadButton" onClick={getImages}>
              Click to See Photos
            </button>
            {/*serverImages && aggregateWkds(serverImages)*/}
            {serverImages && pushToItemCounter(serverImages)}
            {serverImages &&
              serverImages.map((photo) => {
                !objHolder[photo.wkd_id]
                  ? (objHolder[photo.wkd_id] = 1)
                  : objHolder[photo.wkd_id]++;
              })}

            {Object.keys(objHolder).map((item, key) => (
              <li key={item} className="li">
                <div />
                <div className="colored-text-holder">
                  <div className="olive-text">{item}</div>
                  <div className="orange-text">
                    {Object.values(objHolder)[key]}
                  </div>
                </div>
              </li>
            ))}
          </div>
        </div>
      </>
    );
  }
};

const Home = () => {
  return (
    <main className="root">
      <Body />
    </main>
  );
};

ReactDOM.render(<Home />, document.getElementById("root"));
