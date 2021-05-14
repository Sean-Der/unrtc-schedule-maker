/* global $ fetch bootstrap */

$(document).ready(function () {
  let table = null
  let errorModal = new bootstrap.Modal(document.getElementById('errorModal'), {});

  const populateSessions = () => {
    fetch('/sessions')
      .then(response => response.json())
      .then(data => {
        if (table) {
          table.clear()
          table.rows.add(data).draw()
          return
        }

        console.log('populateSessions data', data)

        table = $('#scheduleTable').DataTable({
          data: data,
          paging: false,
          ordering: false,
          bInfo: false,
          fixedColumns: {
            leftColumns: 1
          },
          language: {
            search: '_INPUT_'
          },
          columns: [
            {
              data: null,
              defaultContent: "<button class='btn btn-secondary join'>Join</button><button class='btn btn-secondary update' data-bs-toggle='modal' data-bs-target='#updateSessionModal'>Edit</button>"
            },
            { data: 'id', visible: false },
            { data: 'time' },
            { data: 'name' },
            { data: 'host', fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                if(oData.hostlink) {
                  $(nTd).html("<a href='"+oData.hostlink+"' target='_blank'>"+oData.host+"</a>");
                }
              }
            },
            { data: 'description' },
            { data: 'duration' }
          ]
        })
        $('.dataTables_length').addClass('bs-select')

        $('#scheduleTable tbody').on('hover', 'tr', event => {

        })

        // $('#scheduleTable tbody').on('click', 'tr', event => {
        //   // window.open(`https://unrtc.co/group/${event.currentTarget.rowIndex}`)
        //   window.open(`https://unrtc.co/group/session-${table.row( event.currentTarget ).data().id}`)
        //  })
       $('#scheduleTable tbody').on( 'click', 'button.join', function () {
          var data = table.row( $(this).parents('tr') ).data();
          window.open(`https://unrtc.co/group/session-${data.id}`)
       } );
       $('#scheduleTable tbody').on( 'click', 'button.update', function () {
           var data = table.row( $(this).parents('tr') ).data();
           updateModalData(data);

       } );
      })
  }

  $('#submit-session-button').click(() => {
    const data = {
      time: 'Unscheduled',
      name: $('#createSessionModal #inputSessionName').val(),
      host: $('#createSessionModal #inputHostName').val(),
      hostlink: $('#createSessionModal #inputHostLink').val(),
      duration: $('#createSessionModal #inputDuration').val(),
      description: $('#createSessionModal #inputDescription').val()
    }

    fetch('/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (response.status !== 200) {
        errorModal.show()
      } else {
        $('input, textarea').each((i, el) => {
          $(el).val('')
        })
      }

      populateSessions()
    })
  })

  $('#update-session-button').click(() => {
    const data = {
      id: parseInt($('#updateSessionModal #inputSessionId').val()),
      time: $('#updateSessionModal #inputTime').val() || 'Unscheduled',
      name: $('#updateSessionModal #inputSessionName').val(),
      host: $('#updateSessionModal #inputHostName').val(),
      hostlink: $('#updateSessionModal #inputHostLink').val(),
      duration: $('#updateSessionModal #inputDuration').val(),
      description: $('#updateSessionModal #inputDescription').val()
    }

    console.log('update button', data)

    fetch('/session', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (response.status !== 200) {
        errorModal.show()
      } else {
        $('input, textarea').each((i, el) => {
          $(el).val('')
        })
      }

      populateSessions()
    })
  })

  const updateModalData  = (data) => {
    console.log('updateModalData', data)
    $('#updateSessionModal #inputSessionId').val(Number(data.id));
    $('#updateSessionModal #inputSessionName').val(data.name);
    $('#updateSessionModal #inputHostName').val(data.host);
    $('#updateSessionModal #inputHostLink').val(data.hostlink);
    $('#updateSessionModal #inputDescription').val(data.description);
    $('#updateSessionModal #inputDuration').val(data.duration);
    $('#updateSessionModal #inputTime').val(data.time);
  }

  $('#updateSessionModal').on('hide.bs.modal',function(e) {
    $('#updateSessionModal #inputSessionId').val('');
    $('#updateSessionModal #inputSessionName').val('');
    $('#updateSessionModal #inputHostName').val('');
    $('#updateSessionModal #inputHostLink').val('');
    $('#updateSessionModal #inputDescription').val('');
    $('#updateSessionModal #inputDuration').val('');
    $('#updateSessionModal #inputTime').val('');
  });

  populateSessions()
})
