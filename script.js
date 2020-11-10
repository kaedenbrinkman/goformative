function submitForm() {
  var id = $("#formative-id").val();
  var token = $("#formative-id").val();
  var user = $("#user-id").val();
  if ((((id != token) != user) != undefined) != "") {
    window.location =
      "https://kaedenbrinkman.github.io/goformative/post?id=" +
      id +
      "&token=" +
      token +
      "&user=" +
      user;
  }
}

function getResponse() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var id = urlParams.get("id");
  var token = urlParams.get("token");
  var user = urlParams.get("user");
  var settings = {
    url: "https://goformative.com/graphql/query/FormativeStudentData",
    method: "POST",
    timeout: 0,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      operationName: "FormativeStudentData",
      variables: {
        formativeId: id,
        includeItems: true,
        ownerId: user,
        withPoints: true,
      },
      query:
        "query FormativeStudentData($formativeId: ID!, $ownerId: ID!, $includeItems: Boolean!, $withPoints: Boolean!) {\n  formative(id: $formativeId) {\n    ...FormativeStudentFormative\n    __typename\n  }\n  answers: answersByFormativeAndOwner(formativeId: $formativeId, owner: $ownerId) {\n    ...FormativeStudentAnswer\n    __typename\n  }\n}\n\nfragment FormativeStudentFormative on Formative {\n  _id\n  headerColor\n  headerImage\n  items @include(if: $includeItems) {\n    ...FormativeStudentFormativeItem\n    __typename\n  }\n  lastOverallUpdate\n  owner {\n    _id\n    firstName\n    lastName\n    nickname\n    __typename\n  }\n  title\n  updatedAt\n  __typename\n}\n\nfragment FormativeStudentAnswer on Answer {\n  _id\n  content\n  drawing {\n    d\n    id\n    __typename\n  }\n  formativeItem {\n    _id\n    __typename\n  }\n  points @include(if: $withPoints)\n  scoreFactor @include(if: $withPoints)\n  type\n  __typename\n}\n\nfragment FormativeStudentFormativeItem on FormativeItem {\n  _id\n  details {\n    canvas\n    canvasImageList\n    correctAnswers\n    choiceLabels\n    choices\n    isDrawingEnabled\n    isProcessing\n    isRandomized\n    labels\n    points\n    pins {\n      formativeItemId\n      number\n      x\n      y\n      __typename\n    }\n    src\n    targets {\n      label\n      choices\n      __typename\n    }\n    __typename\n  }\n  feedbackMessages(orderBy: {field: CREATED, direction: ASC}, includeReplies: true, studentIds: [$ownerId]) {\n    nodes {\n      _id\n      answer {\n        _id\n        __typename\n      }\n      createdAt\n      from {\n        _id\n        firstName\n        lastName\n        nickname\n        __typename\n      }\n      isRead\n      text\n      to {\n        _id\n        firstName\n        lastName\n        nickname\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  helpText\n  html\n  number\n  parentId\n  position\n  subtype\n  text\n  type\n  updatedAt\n  __typename\n}\n",
    }),
  };

  $.ajax(settings).done(function (response) {
    useResponse(response);
  });
}

function useResponse(r) {
  console.log(r);
  $("#formative-title").html(r.data.formative.title);
  if (r.errors != undefined) {
    $("#cardiv").html(
      "<p>Error connecting. Check that the information you entered is correct.</p>"
    );
  } else {
    var ans = r.data.answers;
    console.log(ans);
    if (ans.length == 0) {
      $("#cardiv").html(
        "<p>No answers available. Check that the formative is open, or open the console for more information.</p>"
      );
    }
    for (var i = 0; i < ans.length; i++) {
      var a = ans[i];
      var answer = a.content.answer;
      var id = a._id;
      var qType = a.type;
      if (qType === "multipleChoice") {
        qType = "Multiple Choice";
        answer = getMC(answer, id, r);
      } else if (qType === "numeric") {
        qType = "Numeric";
      } else if (qType === "shortAnswer") {
        qType = "Short Answer";
      } else if (qType === "multipleSelection") {
        qType = "Multiple Selection";
      }
      var question = getQ(id, r);
      if (question.indexOf(":") != -1) {
        question = question.substring(question.indexOf(":") + 1);
      }
      if (
        question.indexOf('"text":"') != -1 &&
        question.indexOf(',"type":"') != -1
      ) {
        question = question.substring(
          question.indexOf('"text":"') + '"text":"'.length,
          question.indexOf(',"type":"') - 1
        );
      }
      var htmlToAdd =
        '<div class="media text-muted pt-3"><svg class="bd-placeholder-img mr-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: 32x32"><title>Placeholder</title><rect width="100%" height="100%" fill="#007bff"></rect><text x="50%" y="50%" fill="#007bff" dy=".3em">32x32</text></svg><div class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray"><div class="d-flex justify-content-between align-items-center w-100"><strong class="text-gray-dark">' +
        qType +
        '</strong></div><span class="d-block">Question: ' +
        question +
        '</span><span class="d-block">Answer: ' +
        answer +
        "</span></div></div>";
      $("#cardiv").html($("#cardiv").html() + htmlToAdd);
    }
  }
}

function getMC(answer, id, r) {
  if (id.indexOf("-") != -1) {
    id = id.substring(0, id.indexOf("-"));
  }
  answer = answer[0];
  console.log("getMC()");
  console.log(id);
  console.log(answer);
  var toReturn = answer;
  //Looking for the label for this MC answer for the question with this ID in the data r.
  var qs = r.data.formative.items;
  for (var i = 0; i < qs.length; i++) {
    if (qs[i]._id === id) {
      console.log("Found question with ID: " + id);
      console.log(qs[i]);
      if (qs[i].details.choices.indexOf(answer) != -1) {
        toReturn = qs[i].details.choiceLabels[qs[i].details.choices.indexOf(answer)];
      }
      break;
    }
  }
  return toReturn;
}

function getQ(id, r) {
  if (id.indexOf("-") != -1) {
    id = id.substring(0, id.indexOf("-"));
  }
  var toReturn = "Unknown";
  //Looking for the label for this MC answer for the question with this ID in the data r.
  var qs = r.data.formative.items;
  for (var i = 0; i < qs.length; i++) {
    if (qs[i]._id === id) {
      toReturn = qs[i].text;
      break;
    }
  }
  return toReturn;
}

function getStrings() {
  if (
    window.location.origin === "https://goformative.com" &&
    window.location.pathname.substring(0, 12) === "/formatives/"
  ) {
    var formativeID = window.location.pathname.substring(12);
  } else {
    console.log("This script needs to be run from an open GoFormative.");
  }
}
