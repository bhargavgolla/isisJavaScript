/*
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */
package integtests.colls;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;
import integtests.AbstractIntegTest;

import java.util.List;

import dom.todo.ToDoItem;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class ToDoItem_dependencies_remove extends AbstractIntegTest {

    private ToDoItem toDoItem;
    private ToDoItem otherToDoItem;
    private ToDoItem yetAnotherToDoItem;
    private boolean isComplete;
    

    @Before
    public void setUp() throws Exception {
        // given
        final List<ToDoItem> items = wrap(toDoItems).notYetComplete();
        toDoItem = wrap(items.get(0));
        otherToDoItem = items.get(1); // wrapping this seems to trip up cglib :-(
        yetAnotherToDoItem = items.get(2); // wrapping this seems to trip up cglib :-(
        
        toDoItem.add(otherToDoItem);

        isComplete = toDoItem.isComplete();
    }

    @After
    public void tearDown() throws Exception {
        unwrap(toDoItem).getDependencies().clear();
        unwrap(toDoItem).setComplete(isComplete);
    }

    @Test
    public void happyCase() throws Exception {

        // given
        assertThat(toDoItem.getDependencies().size(), is(1));
        
        // when
        toDoItem.remove(otherToDoItem);
        
        // then
        assertThat(toDoItem.getDependencies().size(), is(0));
    }


    @Test
    public void cannotRemoveItemIfNotADepedndency() throws Exception {

        // when, then
        expectedExceptions.expectMessage("Not a dependency");
        toDoItem.remove(yetAnotherToDoItem);
    }

    @Test
    public void cannotRemoveDependencyIfComplete() throws Exception {

        // given
        unwrap(toDoItem).setComplete(true);
        
        // when, then
        expectedExceptions.expectMessage("Cannot remove dependencies for items that are complete");
        toDoItem.remove(otherToDoItem);
    }

}