/* global $ fetch bootstrap */

$(document).ready(function () {
  let table = null;
  const errorModal = new bootstrap.Modal(
    document.getElementById("errorModal"),
    {}
  );

  const populateSessions = () => {
    fetch("/sessions")
      .then((response) => response.json())
      .then((data) => {
        if (table) {
          table.clear();
          table.rows.add(data).draw();
          return;
        }

        console.log("populateSessions data", data);

        table = $("#scheduleTable").DataTable({
          responsive: true,
          data: data,
          paging: false,
          // ordering: false,
          bInfo: false,
          fixedColumns: {
            leftColumns: 1,
          },
          language: {
            search: "_INPUT_",
          },
          order: [[2, "asc"]],
          columns: [
            { data: "id", visible: false },
            { data: "time", className: "dragHandle dt-nowrap" },
            { data: "name", className: "dt-wide-column" },
            {
              data: "host",
              className: "dt-nowrap",
              fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                if (oData.hostlink) {
                  $(nTd).html(
                    `<a href='${oData.hostlink}' target='_blank'>${oData.host}</a>`
                  );
                }
              },
            },
            { data: "description" },
            {
              data: "duration",
              className: "dt-nowrap",
              render: function (value) {
                return value + " min";
              },
            },
            {
              data: null,
              className: "dt-nowrap",
              defaultContent:
                "<button class='btn btn-success join'>Join</button><button class='btn btn-light update' data-bs-toggle='modal' data-bs-target='#updateSessionModal'>Edit</button>",
            },
          ],
        });
        $(".dataTables_length").addClass("bs-select");

        $("#scheduleTable tbody").on("hover", "tr", (event) => {});

        $("#scheduleTable tbody").on("click", "button.join", function () {
          const data = table.row($(this).parents("tr")).data();
          window.open(`https://unrtc.co/group/session-${data.id}`);
        });

        $("#scheduleTable tbody").on("click", "button.update", function () {
          const data = table.row($(this).parents("tr")).data();
          updateModalData(data);
        });
      });
  };

  $("#submit-session-button").click(() => {
    const data = {
      time: "Unscheduled",
      name: $("#createSessionModal #inputSessionName").val(),
      host: $("#createSessionModal #inputHostName").val(),
      hostlink: $("#createSessionModal #inputHostLink").val(),
      duration: $("#createSessionModal #inputDuration").val(),
      description: $("#createSessionModal #inputDescription").val(),
    };

    fetch("/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.status !== 200) {
        $("#error-body").text(response.text);
        errorModal.show();
      } else {
        $("input, textarea").each((i, el) => {
          $(el).val("");
        });
      }

      populateSessions();
    });
  });

  $("#update-session-button").click(() => {
    const data = {
      id: parseInt($("#updateSessionModal #inputSessionId").val()),
      time: $("#updateSessionModal #inputSessionTime").val() || "Unscheduled",
      name: $("#updateSessionModal #inputSessionName").val(),
      host: $("#updateSessionModal #inputHostName").val(),
      hostlink: $("#updateSessionModal #inputHostLink").val(),
      duration: $("#updateSessionModal #inputDuration").val(),
      description: $("#updateSessionModal #inputDescription").val(),
      deleted: $("#updateSessionModal #inputDeleted").val(),
    };

    fetch("/session", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.status !== 200) {
        response.text().then((text) => {
          $("#error-body").text(text);
          errorModal.show();
        });
      } else {
        $("input, textarea").each((i, el) => {
          $(el).val("");
        });
      }

      populateSessions();
    });
  });

  const updateModalData = (data) => {
    $("#updateSessionModal #inputSessionId").val(Number(data.id));
    $("#updateSessionModal #inputSessionName").val(data.name);
    $("#updateSessionModal #inputHostName").val(data.host);
    $("#updateSessionModal #inputHostLink").val(data.hostlink);
    $("#updateSessionModal #inputDescription").val(data.description);
    $("#updateSessionModal #inputDuration").val(data.duration);
    $("#updateSessionModal #inputSessionTime").val(data.time);
  };

  populateSessions();

  $("#scheduleTable").tableDnD({
    dragHandle: ".dragHandle",
  });
});
