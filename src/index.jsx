import ForgeUI, { render, TextField, Form, Text, useState, ModalDialog, Fragment,
                  GlobalPage, Button, ButtonSet, Table, Head, Row, Cell, Select, Option, Link,
                  DatePicker } from '@forge/ui';
import api, { route } from '@forge/api';

var projects = [];
var projectNames = [];

var customFieldNames = [];
var customFields = [];

var customFieldContexts = [];

var issues = [];

var chosenProjects = [];
var chosenCustomFields = [];

var customFieldTableData = [];

var statuses = [];

var workflows = [];

var statusTableData = [];

/*const generateTableData = async (selectedProjects, selectedCustomFields) => {

  //Getting the issues in the selected projects
  console.log(selectedProjects);
  console.log(selectedCustomFields);

  for (const project of selectedProjects) {
    console.log(project);
    const issueResponse = await api.asUser().requestJira(route`/rest/api/2/search?jql=project=${project.key}&maxResults=1000`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    console.log("Egy projekt issue-jai megvannak :D");
    const parsedIssueResponse = await issueResponse.json();
    issues.push(parsedIssueResponse.issues);
  }
  console.log(issues);

  //Getting the custom field contexts

  for (const customField of selectedCustomFields) {
    const customFieldContextResponse = await api.asUser().requestJira(route`/rest/api/3/field/${customField.id}/context/projectmapping`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    const parsedCustomFieldContextResponse = await customFieldContextResponse.json();
    parsedCustomFieldContextResponse.values.push({"fieldID": customField.id});
    customFieldContexts.push(parsedCustomFieldContextResponse.values);
  }

  //Filling the table with the necessary custom field data

  //------------------------------//

  var rowContent = [];

  for (var project = 0; project < selectedProjects.length; project++) {
    var projectID = selectedProjects[project].id;
    for (var customFieldContext = 0; customFieldContext < customFieldContexts.length; customFieldContext++) {
      for (var contextObject = 0; contextObject < customFieldContexts[customFieldContext].length - 1; contextObject++) {
        if (customFieldContexts[customFieldContext][contextObject].projectId != undefined && customFieldContexts[customFieldContext][contextObject].projectId == projectID) {
          rowContent[0] = {"name": selectedProjects[project].name, "key": selectedProjects[project].key};
          customFieldID = -1;
          for (var customField = 0; customField < selectedCustomFields.length; customField++) {
            if (selectedCustomFields[customField].id == customFieldContexts[customFieldContext][customFieldContexts[customFieldContext].length - 1].fieldID) {
              var customFieldID = selectedCustomFields[customField].id;
              rowContent[1] = {"name": selectedCustomFields[customField].name, "id": selectedCustomFields[customField].id};
              break;
            }
          }
          var issueCounter = 0;
          for (var issue = 0; issue < issues.length; issue++) {
            if (issues[issue].length == 0) {
              continue;
            }
            if (issues[issue][0].key.substring(0, selectedProjects[project].key.length) != selectedProjects[project].key) {
              continue;
            }
            for (var issueObject = 0; issueObject < issues[issue].length; issueObject++) {
              if (issues[issue][issueObject].fields[customFieldID] != undefined && issues[issue][issueObject].fields[customFieldID] != null) {
                issueCounter++;
              }
            }
            rowContent[3] = issueCounter;
          }
          rowContent[3] = issueCounter;
          const numberOfAllIssues = selectedProjects[project].insight.totalIssueCount;
          rowContent[2] = numberOfAllIssues - issueCounter;
          rowContent[4] = numberOfAllIssues;
          customFieldTableData.push(rowContent);
          rowContent = [];
        }
      }
    }
  }
}*/

const App = () => {

  const [wasCustomFieldClicked, setCustomFieldClicked] = useState(false);

  const [wasWorkflowClicked, setWorkflowClicked] = useState(false);
  
  const [isWorkflowPopupOpen, setWorkflowPopup] = useState(false);

  const [isOtherPopupOpen, setOtherPopup] = useState(false);

  const [projectOptions, setProjectOptions] = useState([]);

  const [customFieldOptions, setCustomFieldOptions] = useState([]);

  const [statusOptions, setStatusOptions] = useState([]);

  const [workflowOptions, setWorkflowOptions] = useState([]);

  const [areProjectsSelected, setAreProjectsSelected] = useState(false);

  const [areCustomFieldsSelected, setAreCustomFieldsSelected] = useState(false);

  const [areStatusesSelected, setAreStatusesSelected] = useState(false);

  const [areWorkflowsSelected, setAreWorkflowsSelected] = useState(false);

  const [isBadDatePopupOpen, setIsBadDatePopupOpen] = useState(false);

  const handleCustomFields = async () => {
    setCustomFieldClicked(true);
    setWorkflowClicked(false);
    setAreCustomFieldsSelected(false);
    setAreStatusesSelected(false);
    setAreWorkflowsSelected(false);

    //Getting the available projects

    var startAt = 0, maxResults = 50;
    var receivedAllProjects = false;

    while(!receivedAllProjects) {
      const projectResponse = await api.asUser().requestJira(route`/rest/api/3/project/search?startAt=${startAt}&maxResults=${maxResults}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      const parsedProjectResponse = await projectResponse.json();
      const projectContainer = parsedProjectResponse.values;
      if (projectContainer.length > 0) {
        projectContainer.forEach(project => {
          projects.push(project);
        });
        startAt += maxResults;
      } else {
        receivedAllProjects = true;
      }
    }

    //Adding the names of the projects to the projects dropdown

    var projectsToAddToDropdown = [];
    for (const project of projects) {
      projectsToAddToDropdown.push({label: project.name, value: project.name});
    }
    setProjectOptions(projectsToAddToDropdown);

    //Getting the available custom fields

    const customFieldResponse = await api.asUser().requestJira(route`/rest/api/3/field`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    const parsedCustomFieldResponse = await customFieldResponse.json();
    
      //Collecting the custom fields

    for (const field of parsedCustomFieldResponse) {
      if (field.custom) {
        customFields.push(field);
      }
    }

    //Adding the custom field names to the appropriate dropdown

    var customFieldNamesToAddToDropdown = [];
    for (const customField of customFields) {
      customFieldNamesToAddToDropdown.push({label: customField.name, value: customField.name});
    }
    setCustomFieldOptions(customFieldNamesToAddToDropdown);

    //Getting the issues in the available projects

    /*for (const project of projects) {
      const issueResponse = await api.asUser().requestJira(route`/rest/api/2/search?jql=project=${project.key}&maxResults=1000`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      const parsedIssueResponse = await issueResponse.json();
      //console.log(parsedIssueResponse.issues);
      issues.push(parsedIssueResponse.issues);
    }

    //Getting the custom field contexts

    for (const customField of customFields) {
      const customFieldContextResponse = await api.asUser().requestJira(route`/rest/api/3/field/${customField.id}/context`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      const parsedCustomFieldContextResponse = await customFieldContextResponse.json();
      parsedCustomFieldContextResponse.values.push({"fieldID": customField.id});
      customFieldContexts.push(parsedCustomFieldContextResponse.values);
    }*/

  }
  
  const handleWorkflows = async () => {
    
    setWorkflowClicked(true);
    setCustomFieldClicked(false);
    setAreCustomFieldsSelected(false);
    setAreProjectsSelected(false);
    setAreStatusesSelected(false);
    setAreWorkflowsSelected(false);

    //Collecting all workflow statuses

    const statusResponse = await api.asUser().requestJira(route`/rest/api/3/status`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    statuses = await statusResponse.json();

    //Adding the names of the workflow statuses to the status dropdown

    var statusNamesToAddToDropdown = [];
    for (const status of statuses) {
      statusNamesToAddToDropdown.push({label: status.name, value: status.name})
    }
    setStatusOptions(statusNamesToAddToDropdown);

    //Getting all workflows

    /*const workflowResponse = await api.asUser().requestJira(route`/rest/api/3/workflow/search?expand=statuses`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    const parsedWorkflowResponse = await workflowResponse.json();
    workflows = parsedWorkflowResponse.values;*/

    //Adding the workflow names to the workflow dropdown

    /*var workflowsNamesToAddToDropdown = [];
    for (const workflow of workflows) {
      workflowsNamesToAddToDropdown.push({label: workflow.id.name, name: workflow.id.name});
    }
    setWorkflowOptions(workflowsNamesToAddToDropdown);*/

  }
  
  const handleOther = async () => {
    
  }

  const handleOtherElementSubmit = async () => {

  }

  const handleCustomFieldDataSelection = async (formData) => {
    chosenProjects = formData.projectSelect;
    chosenCustomFields = formData.customFieldSelect;
    if (chosenProjects.length > 0) {
      setAreProjectsSelected(true);
    }
    if (chosenProjects.length == 0) {
      setAreProjectsSelected(false);
    }
    if (chosenCustomFields.length > 0) {
      setAreCustomFieldsSelected(true);
      if (chosenProjects.length == 0) {
        var selectedProjects = [];
        var startAt = 0, maxResults = 50;
        var receivedAllProjects = false;

        while(!receivedAllProjects) {
          const projectResponse = await api.asUser().requestJira(route`/rest/api/3/project/search?expand=insight&startAt=${startAt}&maxResults=${maxResults}`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          const parsedProjectResponse = await projectResponse.json();
          const projectContainer = parsedProjectResponse.values;
          if (projectContainer.length > 0) {
            projectContainer.forEach(project => {
              selectedProjects.push(project);
            });
            startAt += maxResults;
          } else {
            receivedAllProjects = true;
          }
        }
        
        //Getting the available custom fields

        const customFieldResponse = await api.asUser().requestJira(route`/rest/api/3/field`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        const parsedCustomFieldResponse = await customFieldResponse.json();
        
        //Collecting the custom fields

        for (const field of parsedCustomFieldResponse) {
          if (field.custom) {
            customFields.push(field);
          }
        }

        //Separating the selected custom fields from the rest

        var selectedCustomFields = [];

        for (const customFieldName of chosenCustomFields) {
          for (const customField of customFields) {
            if (customField.name == customFieldName) {
              selectedCustomFields.push(customField);
              break;
            }
          }
        }

        //Getting the issues in the selected projects

        for (const project of selectedProjects) {
          const issueResponse = await api.asUser().requestJira(route`/rest/api/2/search?jql=project=${project.key}&maxResults=1000`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          const parsedIssueResponse = await issueResponse.json();
          issues.push(parsedIssueResponse.issues);
        }

        //Getting the custom field contexts

        var startAt = 0, maxResults = 50;
        var receivedAllCustomFieldContexts = false;

        for (const customField of selectedCustomFields) {
          while(!receivedAllCustomFieldContexts) {
            const customFieldContextResponse = await api.asUser().requestJira(route`/rest/api/3/field/${customField.id}/context/projectmapping?startAt=${startAt}&maxResults=${maxResults}`, {
              headers: {
                'Accept': 'application/json'
              }
            });
            const parsedCustomFieldContextResponse = await customFieldContextResponse.json();
            //console.log(parsedCustomFieldContextResponse);
            if (parsedCustomFieldContextResponse.values.length == 0) {
              receivedAllCustomFieldContexts = true;
            } else {
              parsedCustomFieldContextResponse.values.push({"fieldID": customField.id});
              customFieldContexts.push(parsedCustomFieldContextResponse.values);
              startAt += maxResults;
            }
          }
          startAt = 0;
          receivedAllCustomFieldContexts = false;
        }

        //Filling the table with the necessary custom field data

        //------------------------------//

        var rowContent = [];

        for (var project = 0; project < selectedProjects.length; project++) {
          var projectID = selectedProjects[project].id;
          for (var customFieldContext = 0; customFieldContext < customFieldContexts.length; customFieldContext++) {
            for (var contextObject = 0; contextObject < customFieldContexts[customFieldContext].length - 1; contextObject++) {
              if (customFieldContexts[customFieldContext][contextObject].projectId != undefined && customFieldContexts[customFieldContext][contextObject].projectId == projectID) {
                rowContent[0] = {"name": selectedProjects[project].name, "key": selectedProjects[project].key};
                customFieldID = -1;
                for (var customField = 0; customField < selectedCustomFields.length; customField++) {
                  if (selectedCustomFields[customField].id == customFieldContexts[customFieldContext][customFieldContexts[customFieldContext].length - 1].fieldID) {
                    var customFieldID = selectedCustomFields[customField].id;
                    rowContent[1] = {"name": selectedCustomFields[customField].name, "id": selectedCustomFields[customField].id};
                    break;
                  }
                }
                var issueCounter = 0;
                for (var issue = 0; issue < issues.length; issue++) {
                  if (issues[issue].length == 0) {
                    continue;
                  }
                  if (issues[issue][0].key.substring(0, selectedProjects[project].key.length) != selectedProjects[project].key) {
                    continue;
                  }
                  for (var issueObject = 0; issueObject < issues[issue].length; issueObject++) {
                    if (issues[issue][issueObject].fields[customFieldID] != undefined && issues[issue][issueObject].fields[customFieldID] != null) {
                      //console.log("Feltétel teljesült! :D");
                      issueCounter++;
                    }
                  }
                  rowContent[3] = issueCounter;
                }
                rowContent[3] = issueCounter;
                const numberOfAllIssues = selectedProjects[project].insight.totalIssueCount;
                rowContent[2] = numberOfAllIssues - issueCounter;
                rowContent[4] = numberOfAllIssues;
                customFieldTableData.push(rowContent);
                rowContent = [];
              }
            }
          }
        }
      }
    }
    if (chosenCustomFields.length == 0) {
      setAreCustomFieldsSelected(false);
    }
    if (chosenProjects.length > 0 && chosenCustomFields.length > 0) {
      //console.log("Generating table data... :D");

      //Getting the available projects

      var startAt = 0, maxResults = 50;
      var receivedAllProjects = false;

      while(!receivedAllProjects) {
        const projectResponse = await api.asUser().requestJira(route`/rest/api/3/project/search?expand=insight&startAt=${startAt}&maxResults=${maxResults}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        const parsedProjectResponse = await projectResponse.json();
        const projectContainer = parsedProjectResponse.values;
        if (projectContainer.length > 0) {
          projectContainer.forEach(project => {
            projects.push(project);
          });
          startAt += maxResults;
        } else {
          receivedAllProjects = true;
        }
      }

      //Separating the chosen projects from the rest

      var selectedProjects = [];

      for (const projectName of chosenProjects) {
        for (const project of projects) {
          if (project.name == projectName) {
            selectedProjects.push(project);
            break;
          }
        }
      }

      //Getting the available custom fields

      const customFieldResponse = await api.asUser().requestJira(route`/rest/api/3/field`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      const parsedCustomFieldResponse = await customFieldResponse.json();
      
      //Collecting the custom fields

      for (const field of parsedCustomFieldResponse) {
        if (field.custom) {
          customFields.push(field);
        }
      }

      //Separating the selected custom fields from the rest

      var selectedCustomFields = [];

      for (const customFieldName of chosenCustomFields) {
        for (const customField of customFields) {
          if (customField.name == customFieldName) {
            selectedCustomFields.push(customField);
            break;
          }
        }
      }

      //Getting the issues in the selected projects

      for (const project of selectedProjects) {
        const issueResponse = await api.asUser().requestJira(route`/rest/api/2/search?jql=project=${project.key}&maxResults=1000`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        const parsedIssueResponse = await issueResponse.json();
        issues.push(parsedIssueResponse.issues);
      }

      //Getting the custom field contexts

      var startAt = 0, maxResults = 50;
      var receivedAllCustomFieldContexts = false;

      for (const customField of selectedCustomFields) {
        while(!receivedAllCustomFieldContexts) {
          const customFieldContextResponse = await api.asUser().requestJira(route`/rest/api/3/field/${customField.id}/context/projectmapping?startAt=${startAt}&maxResults=${maxResults}`, {
            headers: {
              'Accept': 'application/json'
            }
          });
          const parsedCustomFieldContextResponse = await customFieldContextResponse.json();
          //console.log(parsedCustomFieldContextResponse);
          if (parsedCustomFieldContextResponse.values.length == 0) {
            receivedAllCustomFieldContexts = true;
          } else {
            parsedCustomFieldContextResponse.values.push({"fieldID": customField.id});
            customFieldContexts.push(parsedCustomFieldContextResponse.values);
            startAt += maxResults;
          }
        }
        startAt = 0;
        receivedAllCustomFieldContexts = false;
      }

      //Filling the table with the necessary custom field data

      //------------------------------//

      var rowContent = [];

      for (var project = 0; project < selectedProjects.length; project++) {
        var projectID = selectedProjects[project].id;
        for (var customFieldContext = 0; customFieldContext < customFieldContexts.length; customFieldContext++) {
          for (var contextObject = 0; contextObject < customFieldContexts[customFieldContext].length - 1; contextObject++) {
            if (customFieldContexts[customFieldContext][contextObject].projectId != undefined && customFieldContexts[customFieldContext][contextObject].projectId == projectID) {
              rowContent[0] = {"name": selectedProjects[project].name, "key": selectedProjects[project].key};
              customFieldID = -1;
              for (var customField = 0; customField < selectedCustomFields.length; customField++) {
                if (selectedCustomFields[customField].id == customFieldContexts[customFieldContext][customFieldContexts[customFieldContext].length - 1].fieldID) {
                  var customFieldID = selectedCustomFields[customField].id;
                  rowContent[1] = {"name": selectedCustomFields[customField].name, "id": selectedCustomFields[customField].id};
                  break;
                }
              }
              var issueCounter = 0;
              for (var issue = 0; issue < issues.length; issue++) {
                if (issues[issue].length == 0) {
                  continue;
                }
                if (issues[issue][0].key.substring(0, selectedProjects[project].key.length) != selectedProjects[project].key) {
                  continue;
                }
                for (var issueObject = 0; issueObject < issues[issue].length; issueObject++) {
                  if (issues[issue][issueObject].fields[customFieldID] != undefined && issues[issue][issueObject].fields[customFieldID] != null) {
                    //console.log("Feltétel teljesült! :D");
                    issueCounter++;
                  }
                }
                rowContent[3] = issueCounter;
              }
              rowContent[3] = issueCounter;
              const numberOfAllIssues = selectedProjects[project].insight.totalIssueCount;
              rowContent[2] = numberOfAllIssues - issueCounter;
              rowContent[4] = numberOfAllIssues;
              customFieldTableData.push(rowContent);
              rowContent = [];
            }
          }
        }
      }
    }
  }

  const handleWorkflowDataSelection = async (formData) => {

    const chosenStatuses = formData.statusSelect;
    //const chosenWorkflows = formData.workflowSelect;
    const startDate = formData.workflowStartDate;
    const endDate = formData.workflowEndDate;
    if (endDate < startDate) {
      setIsBadDatePopupOpen(true);
      return;
    }

    //Getting all workflow statuses

    const statusResponse = await api.asUser().requestJira(route`/rest/api/3/status`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    statuses = await statusResponse.json();

    //Getting all workflows

    /*const workflowResponse = await api.asUser().requestJira(route`/rest/api/3/workflow/search?expand=statuses`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    const parsedWorkflowResponse = await workflowResponse.json();
    workflows = parsedWorkflowResponse.values;*/

    if (chosenStatuses.length > 0) {
      setAreStatusesSelected(true);
      
      for (const chosenStatus of chosenStatuses) {
        /* status was in (Done) DURING ("2022-06-22", "2022-07-25") */
        const statusJQL = "status was in (\"" + chosenStatus + "\") DURING (\"" + startDate + "\", \"" + endDate + "\")";
        const allIssuesLink = "/issues/?jql=" + statusJQL;
        const statusPageLink = "/secure/admin/ViewStatuses.jspa";
        const issueCountResponse = await api.asUser().requestJira(route`/rest/api/3/search?jql=${statusJQL}&maxResults=0`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        const parsedIssueCountResponse = await issueCountResponse.json();
        const issueCount = parsedIssueCountResponse.total;
        statusTableData.push({status: chosenStatus, "issueCount": issueCount, "statusPageLink": statusPageLink, issueLink: allIssuesLink});
      }

      /*if (chosenWorkflows.length == 0) {
        //Only statuses were selected, workflows weren't

        setAreWorkflowsSelected(false);
        for (const status of chosenStatuses) {
          
        }
      } else {
        //Both statuses and workflows were selected

        setAreWorkflowsSelected(true);

      }*/
    }
    /*if (chosenWorkflows.length > 0) {
      setAreWorkflowsSelected(true);
      if (chosenStatuses.length == 0) {
        //Only workflows were selected, statuses weren't

        //Getting all the statuses of the chosen workflows

        var statusesOfChosenWorkflows = [];
        for (const workflowName of chosenWorkflows) {
          for (const workflow of workflows) {
            if (workflow.name == workflowName) {
              statusesOfChosenWorkflows.push({"workflowName": workflowName, "statuses": workflow.statuses});
              break;
            }
          }
        }

      }
    }*/

  }

  return (
    <Fragment>
      <ButtonSet>
        <Button text="Custom fields" onClick={handleCustomFields}/>
        <Button text="Workflows" onClick={handleWorkflows /*() => setWorkflowPopup(true)*/}/>
        <Button text="Other" onClick={() => {setOtherPopup(true)}}/>
      </ButtonSet>
      {isWorkflowPopupOpen && (
        <ModalDialog header="Workflow information" onClose={() => setWorkflowPopup(false)}>
          <Text>We are happy that you are interested in getting insights on workflows in your Jira. Please check into our dedicated support page on this link and let us know your request.</Text>
          <Text>https://everit.biz/jcstatsupport-featurerequest?custom=workflow</Text>
        </ModalDialog>
      )}
      {isOtherPopupOpen && (
        <ModalDialog header="Other information" onClose={() => setOtherPopup(false)}>
          <Text>We are happy that you are interested in getting insights on other custom elements in your Jira.
            Please give us the name of the custom element and our product development team will analyze your question and put it into the development roadmap.
            You can reach our dedicated support page on this link.</Text>
          <Text>https://everit.biz/jcstatsupport-featurerequest</Text>
          <Form onSubmit={handleOtherElementSubmit}>
            <TextField label="Custom element" name="customElementName"></TextField>
          </Form>
        </ModalDialog>
      )}
      {wasCustomFieldClicked && (
        <Form onSubmit={handleCustomFieldDataSelection}>
          <Select label="Projects" name="projectSelect" submitButtonText="" actionButtons={[]} isMulti="true" placeholder="Empty">
            {projectOptions.map(option => <Option {...option} />)}
          </Select>
          <Select label="Custom fields" name="customFieldSelect" submitButtonText="" actionButtons={[]} isMulti={true} placeholder="Empty">
            {customFieldOptions.map(option => <Option {...option} />)}
          </Select>
        </Form>
      )}
      {((areProjectsSelected && areCustomFieldsSelected) || (!areProjectsSelected && areCustomFieldsSelected)) && (
        <Table>
          <Head>
            <Cell><Text>Projects</Text></Cell>
            <Cell><Text>Custom fields</Text></Cell>
            <Cell><Text>Number of empty custom fields</Text></Cell>
            <Cell><Text>Number of filled custom fields</Text></Cell>
            <Cell><Text>Number of all custom fields</Text></Cell>
          </Head>
          {customFieldTableData.map(row => {
            const projectLink = "/browse/" + row[0].key;
            const customFieldLink = "/secure/admin/ConfigureCustomField!default.jspa?customFieldId=" + row[1].id.substring(12);
            const projectPartOfIssueLinks = "project = \"" + row[0].name + "\"";
            const emptyIssuesLink = "/issues/?jql=" + projectPartOfIssueLinks + " and \"" + row[1].name + "\"" + " = empty";
            const filledIssuesLink = "/issues/?jql=" + projectPartOfIssueLinks + " and \"" + row[1].name + "\"" + " != empty";
            const allIssuesLink = "/issues/?jql=" + projectPartOfIssueLinks;
            return (
              <Row>
                <Cell><Text><Link href={projectLink} openNewTab="true">{row[0].name}</Link></Text></Cell>
                <Cell><Text><Link href={customFieldLink} openNewTab="true">{row[1].name}</Link></Text></Cell>
                <Cell><Text><Link href={emptyIssuesLink} openNewTab="true">{row[2]}</Link></Text></Cell>
                <Cell><Text><Link href={filledIssuesLink} openNewTab="true">{row[3]}</Link></Text></Cell>
                <Cell><Text><Link href={allIssuesLink} openNewTab="true">{row[4]}</Link></Text></Cell>
              </Row>
            )
          })}
        </Table>
      )}
      {wasWorkflowClicked && (
        <Form onSubmit={handleWorkflowDataSelection}>
          <Select label="Statuses" name="statusSelect" placeholder="Empty" isMulti="true">
            {statusOptions.map(option => <Option {...option} />)}
          </Select>
          <DatePicker label="Start date" name="workflowStartDate" isRequired="true" placeholder="Please choose the lower date boundary..."></DatePicker>
          <DatePicker label="End date" name="workflowEndDate" isRequired="true" placeholder="Please choose the upper date boundary..."></DatePicker>
        </Form>
      )}
      {isBadDatePopupOpen && (
        <ModalDialog header="Date warning" appearance="warning" onClose={() => {setIsBadDatePopupOpen(false)}}>
          <Text>The end date cannot be less than the start date!</Text>
        </ModalDialog>
      )}
      {areStatusesSelected && /* status was in (Done) DURING ("2022-06-22", "2022-07-25") */ (
        <Table>
          <Head>
            <Cell><Text>Status</Text></Cell>
            <Cell><Text>Number of issues</Text></Cell>
          </Head>
          {statusTableData.map(row => {
            return (
              <Row>
                <Cell>
                  <Text><Link href={row.statusPageLink} openNewTab="true">{row.status}</Link></Text>
                </Cell>
                <Cell>
                  <Text><Link href={row.issueLink} openNewTab="true">{row.issueCount}</Link></Text>
                </Cell>
              </Row>
          )})}
        </Table>
      )}
    </Fragment>
  );
};

export const run = render(
  <GlobalPage>
    <App/>
  </GlobalPage>
);