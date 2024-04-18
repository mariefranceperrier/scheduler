import React from "react";
import axios from "axios";

import { render, cleanup, fireEvent, findByText, getByText, prettyDOM, getAllByTestId, getByAltText , getByPlaceholderText, queryByText, queryByAltText, findByAltText } from "@testing-library/react";

import Application from "components/Application";

afterEach(cleanup);


describe("Application", () => {
  it("defaults to Monday and changes the schedule when a new day is selected", () => {
    const { queryByText, getByText, findByText } = render(<Application />);

    return findByText("Monday").then(() => {
      fireEvent.click(getByText("Tuesday"));
      expect(queryByText("Leopold Silvers")).toBeInTheDocument();
    });
  });
  
  it("loads data, books an interview and reduces the spots remaining for the first day by 1", async () => {
    const { container, debug } = render(<Application />);
    
    await findByText(container, "Archie Cohen");
    
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];

    fireEvent.click(getByAltText(appointment, "Add"));

    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" }
    });

    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));
    fireEvent.click(getByText(appointment, "Save"));
        
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    await findByText(appointment, "Lydia Miller-Jones");
    
    const day = getAllByTestId(container, "day").find(day => queryByText(day, "Monday"));
    
    expect(getByText(day, "no spots remaining")).toBeInTheDocument();
    
  });


  it("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
    // 1. Render the Application.
    const { container, debug } = render(<Application />);

    // 2. Wait until the text "Archie Cohen" is displayed.
    await findByText(container, "Archie Cohen");
       
    // 3. Click the "Delete" button on the booked appointment.
    const appointment = getAllByTestId(container, "appointment").find(appointment => queryByText(appointment, "Archie Cohen"));
    fireEvent.click(queryByAltText(appointment, "Delete"));

    // 4. Check that the confirmation message is shown.
    expect(getByText(appointment, "Are you sure you would like to delete?")).toBeInTheDocument();

    // 5. Click the "Confirm" button on the confirmation.
    fireEvent.click(getByText(appointment, "Confirm"));
    
    // 6. Check that the element with the text "Deleting" is displayed.
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();

    // 7. Wait until the element with the "Add" button is displayed.
    await findByAltText(appointment, "Add");

    // 8. Check that the DayListItem with the text "Monday" also has the text "2 spots remaining".
    
    const day = getAllByTestId(container, "day").find(day => queryByText(day, "Monday"));

    expect(getByText(day, "2 spots remaining")).toBeInTheDocument();
    
  });
  

  it("loads data, edits an interview and keeps the spots remaining for Monday the same", async () => {
    // 1. Render the Application.
    const { container, debug } = render(<Application />);

    // 2. Wait until the text "Archie Cohen" is displayed.
    await findByText(container, "Archie Cohen");

    // 3. Find and click the "Edit" button on an existing appointment.
    const appointment = getAllByTestId(container, "appointment").find(appointment => queryByText(appointment, "Archie Cohen"));
    fireEvent.click(queryByAltText(appointment, "Edit"));

    // 4. Verify that the input field with the current student's name is visible.
    expect(getByPlaceholderText(appointment, /enter student name/i)).toHaveValue("Archie Cohen");

    // 5. Modify the student's name in the input field.
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" }
    });

    // 6. Select a different interviewer from the list.
    fireEvent.click(getByAltText(appointment, "Tori Malcolm"));

    // 7. Click the "Save" button.
    fireEvent.click(getByText(appointment, "Save"));

    // 8. Check that the element with the text "Saving" is displayed.
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    // 9. Wait until the element with the modified student's name is displayed.
    await findByText(appointment, "Lydia Miller-Jones");

    // 10. Check that the DayListItem with the text "Monday" still has the same number of spots remaining.
    const day = getAllByTestId(container, "day").find(day => queryByText(day, "Monday"));
    expect(getByText(day, "1 spot remaining")).toBeInTheDocument();
    
  });


  it("shows the save error when failing to save an appointment",async  () => {
    axios.put.mockRejectedValueOnce();

    const { container, debug } = render(<Application />);

    await findByText(container, "Archie Cohen");
   
    const appointment = getAllByTestId(container, "appointment").find(appointment => queryByText(appointment, "Archie Cohen"));
    fireEvent.click(queryByAltText(appointment, "Edit"));
      
    expect(getByPlaceholderText(appointment, /enter student name/i)).toHaveValue("Archie Cohen");
    
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
        target: { value: "Lydia Miller-Jones" }
      });
      
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));
    fireEvent.click(getByText(appointment, "Save"));
      
    expect(getByText(appointment, "Saving")).toBeInTheDocument();
      
    await findByText(appointment, "Error");
      
    debug();
  });


  
  it("shows the delete error when failing to delete an existing appointment", async () => {
    axios.delete.mockRejectedValueOnce();

    // 1. Render the Application.
    const { container, debug } = render(<Application />);

    // 2. Wait until the text "Archie Cohen" is displayed.
    await findByText(container, "Archie Cohen");

    // 3. Click the "Delete" button on the booked appointment.
    const appointment = getAllByTestId(container, "appointment").find(appointment => queryByText(appointment, "Archie Cohen"));
    fireEvent.click(queryByAltText(appointment, "Delete"));

    // 4. Check that the confirmation message is shown.
    expect(getByText(appointment, "Are you sure you would like to delete?")).toBeInTheDocument();

    // 5. Click the "Confirm" button on the confirmation.
    fireEvent.click(getByText(appointment, "Confirm"));

    // 6. Check that the element with the text "Deleting" is displayed.
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();

    // 7. Wait until the element with the "Add" button is displayed.
    await findByText(appointment, "Error");

    debug();
  });
  
});
