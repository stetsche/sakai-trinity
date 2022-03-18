const sakaiCalendar = {
    calendar: {},
    selection: false,
  
    // Initialize the calendar and attach it to the calendar div.
    initializeSakaiCalendar (calendarDiv) {
      // Get the event color from the skin variables.
      const computedStyle = getComputedStyle(document.querySelector(':root'));
      const eventBackgroundColor = computedStyle.getPropertyValue('--infoBanner-bgcolor', '#e9f5fc');
      const eventTextColor = computedStyle.getPropertyValue('--infoBanner-color', '#196390');
      const sakaiOrigin = window.location.origin;
      const requestHeaders = new Headers();
      requestHeaders.append('pragma', 'no-cache');
      requestHeaders.append('cache-control', 'no-cache');
      const requestInit = {
        method: 'GET',
        headers: requestHeaders,
      };
      // Initialize fullcalendar and render it in the calendarDiv.
      this.calendar = new FullCalendar.Calendar(calendarDiv, {
        initialView: 'timeGridWeek',
        displayEventTime: false,
        nowIndicator: true,
        allDaySlot: false,
        themeSystem: 'bootstrap5',
        selectable: true,
        selectMirror: true,
        unselectAuto: true,
        unselectCancel: '.fc-createEventButton-button',
        headerToolbar: {
          start: 'prev,next today createEventButton',
          center: 'title',
          end: 'dayGridMonth,timeGridWeek,timeGridDay customList'
        },
        select: (selectionInfo) => {
          sakaiCalendar.selection = selectionInfo;
          //console.log(sakaiCalendar.selection);
        },
        unselect: (jsEvent, view) => {
          sakaiCalendar.selection = false;
          console.log(jsEvent);
          //console.log(sakaiCalendar.selection);
        },
        events: [
            { 
                title: 'Class meeting', 
                start: '2022-03-01',
                end: '2022-03-02',
            },
            { 
                title: 'Class meeting', 
                start: '2022-03-04',
                end: '2022-03-04',
            },
            { 
                title: 'Class meeting', 
                start: '2022-03-03',
                end: '2022-03-03',
            },
        ],
        contentHeight: 'auto',
        customButtons: {
            createEventButton: {
                text: 'Create Event',
                click: function() {
                    console.log(sakaiCalendar.selection)
                    alert(`starting create event flow${sakaiCalendar.selection ?
                      ` with selection from ${sakaiCalendar.selection.start.toISOString()} to ${sakaiCalendar.selection.end.toISOString()}` 
                      : 'without selected date'}`);
                },
                /*icon: 'plus-circle-fill'*/
            },
            filterButton: {
                icon: 'funnel-fill',
            },
            cusomListButton: {
                icon: 'funnel-fill',
                click: function() {
                  
                  document.getElementsByClassName("")[0].classList.toggle("visually-hidden");
                },
            },
        },
        views: {
            customList:{
                buttonText: 'List of events',
                classNames: [ 'custom-view' ],
                titleFormat() { return 'Event List' },
                content: (props) => "",
                viewDidMount() {
                    document.getElementById("calendar-list-view").classList.toggle("visually-hidden");
                    document.querySelectorAll(".fc-next-button, .fc-prev-button").forEach(btn => btn.disabled = true)
                },
                viewWillUnmount() {
                    document.getElementById("calendar-list-view").classList.toggle("visually-hidden");
                    document.querySelectorAll(".fc-next-button, .fc-prev-button").forEach(btn => btn.disabled = false)
                }
            },
        }
      });
  
      // Set the user language to the fullcalendar UI.
      this.calendar.render();
    },
  
    // Go to the current date set by the backend.
    gotoDate (currentDate) {
      this.calendar.gotoDate(currentDate);
    },
  
      // When the user changes the view, reflect the change in a param to set the default view.
    onChangeCalendarView () {
      const currentView = this.calendar.currentData.currentViewType;
      const defaultViewParams = document.getElementsByName('calendar_default_subview');
      if (defaultViewParams && defaultViewParams.length > 0) {
        defaultViewParams[0].value = currentView;
      }
      // Reenable the button when the subview changes.
      const changeDefaultViewButton = document.getElementsByName('eventSubmit_doDefaultview');
      if (changeDefaultViewButton && changeDefaultViewButton.length > 0) {
        changeDefaultViewButton[0].removeAttribute('disabled');
      }
      
    },

    // This logic is associated to set the default subview, by day, month, week or list.
    setDefaultSubview (defaultSubview) {
      switch (defaultSubview) {
        case 'day':
          this.calendar.changeView('timeGridDay');
          break;
        case 'month':
          this.calendar.changeView('dayGridMonth');
          break;
        case 'list':
          this.calendar.changeView('listWeek');
          break;
        case 'customList':
          this.calendar.changeView('customList');
          break;
        case 'week':
        default:
          this.calendar.changeView('timeGridWeek');
      }
  
      document.querySelectorAll('.fc-timeGridWeek-button, .fc-dayGridMonth-button, .fc-timeGridDay-button, .fc-listWeek-button').forEach( (viewButton) => viewButton.setAttribute('onclick', 'sakaiCalendar.onChangeCalendarView();'));
  
    },
  
    printCalendar (printableVersionUrl) {
      const currentSelectedDate = new Date(this.calendar.currentData.currentDate.getTime());
      const currentView = this.calendar.currentData.currentViewType.toLowerCase();
  
      /** Calendar Printing Views. */
      // LIST_SUBVIEW = 1;
      // MONTH_VIEW = 3;
      // List is the default subview for weekly, daily and list views.
      let currentPrintview = 1;
      // Different views have different time ranges
      if (currentView.includes('month')) {
        currentPrintview = 3;
      }
  
      // Now we have the right time ranges, we must replace the query params.
      const defaultPrintCalendarUrl = new URL(printableVersionUrl);
      const defaultPrintCalendarParams = defaultPrintCalendarUrl.searchParams;
      defaultPrintCalendarParams.forEach((value, key) => {
        switch(key) {
          case 'scheduleType':
            defaultPrintCalendarParams.set('scheduleType', currentPrintview);
            break;
          default:
        }
      });
      defaultPrintCalendarParams.set('selectedCalendarDate', currentSelectedDate.toISOString());
      // Now we have the right URL, make the print request.
      window.open(defaultPrintCalendarUrl.href, '_blank');
    }
  
  };