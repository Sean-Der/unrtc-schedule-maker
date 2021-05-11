/* global $ fetch */

$(document).ready(function () {
  let table = null

  let populateSessions = () => {
    fetch('/sessions')
      .then(response => response.json())
      .then(data => {
        if (table) {
          table.clear()
          table.rows.add(data).draw()
          return
        }

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
            {data: 'duration'},
            {data: 'time'},
            {data: 'name'},
            {data: 'host'},
            {data: 'description'}
          ]
        })
        $('.dataTables_length').addClass('bs-select')

        $('#scheduleTable tbody').on('click', 'button', function () {
          let data = table.row($(this).parents('tr')).data()
          window.alert(`${data[1]}  clicked!`)
        })
        // full row clickable with data-href
        $('#scheduleTable tbody tr').click(function () {
          window.location.href = $(this).data('href')
        })
      })
  }

  $('#submit-session-button').click(() => {
    let data = {
      time: 'Unscheduled',
      name: $('#inputSessionName').val(),
      host: $('#inputHostName').val(),
      duration: $('#inputDuration').val(),
      description: $('#inputDescription').val()
    }

    fetch('/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (response.status !== 200) {
        window.alert('Session was not created')
      } else {
        $('input, textarea').each((i, el) => {
          $(el).val('')
        })
      }

      populateSessions()
    })
  })

  populateSessions()
})
