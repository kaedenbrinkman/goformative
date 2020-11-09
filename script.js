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
  if (r.errors != undefined) {
    document.write(
      "<h1>Error connecting. Check that the information you entered is correct.</h1>"
    );
  } else {
    var ans = r.data.answers;
    console.log(ans);
    if (ans.length == 0) {
      document.write(
        "<h1>No answers available. Check that the formative is open, or open the console for more information.</h1>"
      );
    }
    for (var i = 0; i < ans.length; i++) {
      var a = ans[i];
      var answerType = "Answer";
      var answer = a.content.answer;
      var id = a._id;
      if (a.type === "multipleChoice") {
        answerType = "Answer ID";
        answer = getMC(answer, id, r);
      }
      document.write(
        '<div class="card"><h1>Type: ' +
          a.type +
          '</h1><p class="text-muted">Question ID: ' +
          id +
          "</p><p>" +
          answerType +
          ": " +
          answer +
          "</p></div>"
      );
    }
  }
}

function getMC(answer, id, r) {
    var toReturn = answer;
    //Looking for the label for this MC answer for the question with this ID in the data r.
    var qs = r.data.formative.items;
    for (var i = 0; i < qs.length; i++) {
        if (qs[i]._id === id) {
            if (indexOf(answer, qs[i].choices) != -1) {
                toReturn = qs[i].choiceLabels[indexOf(answer, qs[i].choices)];
            }
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
